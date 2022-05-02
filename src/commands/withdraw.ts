// Import packages
import Discord from "discord.js";
import { rpc } from "../helper.js";

export default async (interaction: Discord.CommandInteraction) => {
    // Parse the options and userID
    const options = interaction.options;
    const userID = interaction.user.id;

    // Parse the amount and address
    const amount = options.getNumber(`amount`);
    const address = options.getString(`address`);

    // Make sure both values were provided
    if (!amount || !address) {
        await interaction.editReply({
            content: `Please provide an amount and address`,
        });
        return;
    }

    // Validate the address
    if (!/^[B][a-zA-Z0-9]{33}$/.test(address)) {
        await interaction.editReply({
            content: `Please provide a valid address`,
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

    // Withdraw the amount
    const result = await rpc(`sendfrom`, [userID, address, amount]);
    if (result[0]) {
        await interaction.editReply({
            content: `An error occured while creating the transaction`,
        });
        return;
    }

    // Reply with the transaction ID
    await interaction.editReply({
        content: `Success! ${amount} BKC has been sent to ${address} with TXID ${result[1]}`,
    });

    // DM the user the transaction ID if their DM is open
    interaction.channel?.id
        ? interaction.user
              .send({
                  content: `Success! ${amount} BKC has been sent to ${address} with TXID ${result[1]}`,
              })
              .catch(() => {})
        : null;
    return;
};
