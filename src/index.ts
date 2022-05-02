// Import config
import config from "../config.js";

// Import packages
import Discord, { Intents } from "discord.js";
const bot = new Discord.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Helper functions
import createCommands from "./createCommands.js";
import commands from "./commands.js";

bot.on(`ready`, () => {
    // Create the slash commands
    createCommands(bot.application?.commands);

    // Log that the bot is ready
    console.log(`Logged in as ${bot.user?.tag}!`);
});

bot.on(`interactionCreate`, async (interaction) => {
    if (!interaction.isCommand() || interaction.user.bot) return;

    await interaction.deferReply({
        ephemeral: interaction.channel?.id !== undefined,
    });

    const { commandName, options } = interaction;

    const userID = interaction.user.id;

    switch (commandName) {
        case `tip`:
        case `balance`:
        case `deposit`:
        case `withdraw`:
        case `privatekey`: {
            commands[commandName](interaction, userID, options);
            break;
        }
    }
});

bot.login(config.discord.token);
