// Import packages
import Discord from "discord.js";
import { rpc } from "../helper.js";

export default async (interaction: Discord.CommandInteraction, userID: string, options: any) => {
    // Parse the user to tip and the amount
    const toTip = options.getUser(`user`);
    const amount = options.getNumber(`amount`);

    // Make sure both values were provided
    if (!toTip || !amount) {
        await interaction.editReply({
            content: `Please provide a user to tip and an address`,
        });
        return;
    }

    // Make sure the to get tipped user isn't a bot nor the user itself
    if (toTip.bot || toTip.id === userID) {
        await interaction.editReply({
            content: `You can't tip yourself or a bot`,
        });
        return;
    }

    // Fetch the user's balance
    const balance = await rpc(`getbalance`, [userID]);
    if (balance[0]) {
        await interaction.editReply({
            content: `An error occured while fetching your balance`,
        });
        return;
    }

    // Check if the user has enough balance
    if (balance[1] < amount) {
        await interaction.editReply({
            content: `You don't have enough balance`,
        });
        return;
    }

    // Make the tip
    const result = await rpc(`move`, [userID, toTip.id, amount]);
    if (result[0]) {
        await interaction.editReply({
            content: `An error occured while moving the funds`,
        });
        return;
    }

    // Inform the user the tip was successful
    await interaction.editReply({
        content: `Success! ${amount} BKC has been sent to ${toTip.tag}`,
    });

    // DM the user the tip if their DM is open
    interaction.channel?.id
        ? interaction.user
              .send({
                  content: `Success! ${amount} BKC has been sent to ${toTip.tag}`,
              })
              .catch(() => {})
        : null;

    // Inform the to get tipped user of the tip
    toTip
        .send({
            content: `You have been tipped ${amount} BKC by ${interaction.user.tag} (${userID})`,
        })
        .catch(() => {});
};
