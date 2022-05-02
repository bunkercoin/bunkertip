// Import packages
import Discord from "discord.js";
import prismaPackage from "@prisma/client";
const prisma = new prismaPackage.PrismaClient();

export default async (interaction: Discord.CommandInteraction) => {
    // Parse the options and userID
    const options = interaction.options;
    const userID = interaction.user.id;

    // Parse the key and value
    const key = options.getString(`key`);
    const value = options.getBoolean(`value`);

    // Make sure both values are specified
    if (key === null || value === null) {
        interaction.editReply({
            content: `You need to specify both a key and a value`,
        });
        return;
    }

    // Check if the user already exists
    const dbUser = await prisma.user.findUnique({
        where: {
            discordID: userID,
        },
    });

    // Create the user if it doesn't exist
    if (!dbUser) {
        await prisma.user.create({
            data: {
                discordID: userID,
                [key]: value,
            },
        });

        interaction.editReply({
            content: `Success!`,
        });
        return;
    }

    // Update the user
    await prisma.user.update({
        where: {
            discordID: userID,
        },
        data: {
            [key]: value,
        },
    });

    interaction.editReply({
        content: `Success!`,
    });
};
