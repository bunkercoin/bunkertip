// Import packages
import Discord from "discord.js";
import { rpc } from "../helper.js";

export default async (interaction: Discord.CommandInteraction, userID: string, _options: any) => {
    // Get the user's balance
    const balance = await rpc(`getbalance`, [userID]);
    if (balance[0]) {
        await interaction.editReply({
            content: `An error occured while fetching your balance`,
        });
        return;
    }

    await interaction.editReply({
        content: `You currently have ${JSON.stringify(balance[1])} BKC`,
    });
    return;
};
