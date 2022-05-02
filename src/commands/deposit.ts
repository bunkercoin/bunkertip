// Import packages
import Discord from "discord.js";
import { rpc } from "../helper.js";

export default async (interaction: Discord.CommandInteraction) => {
    // Parse the userID
    const userID = interaction.user.id;

    // Check if the user has a wallet
    const hasWallet = await rpc(`getaddressesbyaccount`, [userID]);
    if (hasWallet[0]) {
        await interaction.editReply({
            content: `An error occured while generating a new deposit address`,
        });
        return;
    }

    // If the user already has a wallet
    if (hasWallet[1].length > 0) {
        await interaction.editReply({
            content: `Your deposit address is ${hasWallet[1][0]}`,
        });
        return;
    }
    // If the user doesn't have a wallet yet
    else {
        const newAddress = await rpc(`getnewaddress`, [userID]);
        if (newAddress[0]) {
            await interaction.editReply({
                content: `An error occured while generating a new deposit address`,
            });
            return;
        }

        // Reply with the new address
        await interaction.editReply({
            content: `Your new deposit address is ${newAddress[1]}`,
        });
        return;
    }
};
