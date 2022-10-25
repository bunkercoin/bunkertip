// Import config
import config from "../config.js";

// Import packages
import Discord from "discord.js";
import prismaPackage from "@prisma/client";
const prisma = new prismaPackage.PrismaClient();

// Import helper functions
import { rpc, sleep } from "./helper.js";

export const createRains = async (bot: Discord.Client) => {
    // Get the bunkercoins server and the #rain channel
    const bunkercoinServer = await bot.guilds.fetch(`823882678028861451`);
    if (!bunkercoinServer) {
        return console.log(`Bunkercoin server not found`);
    }
    const rainChannelTemporary = await bunkercoinServer.channels.fetch(`1034169532467662938`);
    if (!rainChannelTemporary) {
        return console.log(`Rain channel not found`);
    }
    const rainChannel = rainChannelTemporary as Discord.TextChannel;

    while (1) {
        // Get the current balance of the bot
        const balance = await rpc(`getbalance`, [`rains`]);
        if (balance[0]) {
            return console.log(`An error occured while fetching the balance of the rains account`);
        }

        // Get the amount to rain and a random phrase
        const amountToRain = Number(balance[1]) / 500 / 18;
        const phrase = config.rains.phrases[Math.floor(Math.random() * config.rains.phrases.length)].replace(
            ` `,
            `​ `,
        );

        // Insert the rain into the database
        const currentDate = new Date();
        await prisma.rains.create({
            data: {
                startTime: currentDate,
                phrase: phrase,
                rewardees: ``,
            },
        });

        // Send the rain message
        await rainChannel.send(
            `A phrasedrop occured! Run </phrasedrop:1034193136605462600> with \`phrase\` being \`${phrase}\` to get up to ${amountToRain} BKC! You have 15 minutes left.`,
        );

        // Wait 15 minutes
        await sleep(15 * 60);

        // Get everyone who responded with the correct message
        const result = await prisma.rains.findUnique({
            where: {
                startTime: currentDate,
            },
        });
        if (!result) {
            console.log(`An error occured while fetching the rewardees`);
            continue;
        }

        // Check if the rain was claimed and if so, send the Bunkercoins
        const rewardeesArray = result.rewardees.split(`,`).slice(0, -1);
        if (!result.rewardees.includes(`,`)) {
            await rainChannel.send(`Unfortunately, no one claimed the rain. Better luck next time!`);
            continue;
        }
        const amountToMove = (amountToRain / rewardeesArray.length).toFixed(8);
        for (const ID of rewardeesArray) {
            const [moveError] = await rpc(`move`, [`rains`, ID, amountToMove]);
            if (moveError) {
                return console.log(`An error occurred while moving funds: ${moveError}`);
            }
        }

        // Inform the users that the rain has ended
        await rainChannel.send(
            `The rain has ended. The following users have been rewarded: ${rewardeesArray
                .map((x) => `<@${x}>`)
                .join(`, `)} with ${amountToRain / rewardeesArray.length} BKC each.`,
        );
    }
};

export const phrasedropCommand = async (interaction: Discord.CommandInteraction) => {
    // Parse the input
    const phraseInput = interaction.options.getString(`phrase`);
    if (!phraseInput) {
        return await interaction.editReply({
            content: `You didn't provide a phrase!`,
        });
    }

    // Check if the phrase doesn't contain any zero-width spaces
    if (phraseInput.includes(`​`)) {
        return await interaction.editReply({
            content: `Don't copy paste the phrase! 😉`,
        });
    }

    // Check if the phrase is correct
    const phrase = await prisma.rains.findMany({
        orderBy: {
            startTime: `desc`,
        },
        take: 1,
    });
    if (!phraseInput[0] || phraseInput !== phrase[0].phrase.replace(`​ `, ` `)) {
        return await interaction.editReply({
            content: `That's not the correct phrase!`,
        });
    }

    // Check if the user has already claimed the rain
    const rewardees = phrase[0].rewardees.split(`,`);
    if (rewardees.includes(interaction.user.id)) {
        return await interaction.editReply({
            content: `You've already claimed the rain!`,
        });
    }

    // Add the user to the rewardees
    await prisma.rains.update({
        where: {
            startTime: phrase[0].startTime,
        },
        data: {
            rewardees: `${phrase[0].rewardees}${interaction.user.id},`,
        },
    });

    // Inform the user that they claimed the rain
    return await interaction.editReply({
        content: `You claimed the rain!`,
    });
};
