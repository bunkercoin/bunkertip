// Import packages
import Discord from "discord.js";
import { rpc } from "../helper.js";
import prismaPackage from "@prisma/client";
const prisma = new prismaPackage.PrismaClient();

export default async (interaction: Discord.CommandInteraction) => {
    // Parse the options
    const options = interaction.options;

    // Check if an user is specified
    let userID: string;
    const user = options.getUser(`user`);

    // Check if that user want to share their balance
    if (user) {
        const dbUser = await prisma.user.findUnique({
            where: {
                discordID: user.id,
            },
        });

        if (!dbUser || !dbUser.sharesBalance) {
            interaction.editReply({
                content: `${user.username} doesn't share their balance`,
            });
            return;
        } else {
            userID = user.id;
        }
    } else {
        userID = interaction.user.id;
    }

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
