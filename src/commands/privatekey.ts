// Import packages
import Discord from "discord.js";
import { rpc } from "../helper.js";

export default async (interaction: Discord.CommandInteraction, userID: string, _options: any) => {
    // Check if the user has a wallet
    const hasWallet = await rpc(`getaddressesbyaccount`, [userID]);
    if (hasWallet[0]) {
        await interaction.editReply({
            content: `An error occured while dumping your private key`,
        });
        return;
    }

    // If the user already has a wallet
    if (hasWallet[1].length > 0) {
        // Dump the private key
        const privateKey = await rpc(`dumpprivkey`, [hasWallet[1][0]]);
        if (privateKey[0]) {
            await interaction.editReply({
                content: `An error occured while dumping your private key`,
            });
            return;
        }

        // Reply with the private key
        await interaction.editReply({
            content: `Your private key is ${privateKey[1]}`,
        });
        return;
    }
    // If the user doesn't have a wallet yet
    else {
        const newAddress = await rpc(`getnewaddress`, [userID]);
        if (newAddress[0]) {
            await interaction.editReply({
                content: `An error occured while dumping your private key`,
            });
            return;
        }

        // Dump the private key
        const privateKey = await rpc(`dumpprivkey`, [newAddress[1]]);
        if (privateKey[0]) {
            await interaction.editReply({
                content: `An error occured while dumping your private key`,
            });
            return;
        }

        // Reply with the private key
        await interaction.editReply({
            content: `Your private key is ${privateKey[1]}`,
        });
        return;
    }
};
