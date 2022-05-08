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

// When someone uses a command
bot.on(`interactionCreate`, async (interaction) => {
    // Make sure it's a command and not used by a bot
    if (!interaction.isCommand() || interaction.user.bot) return;

    // Defer the reply to avoid Unknown interaction error
    await interaction
        .deferReply({
            ephemeral: interaction.channel?.id !== undefined,
        })
        .catch(() => {});

    switch (interaction.commandName) {
        case `tip`:
        case `balance`:
        case `deposit`:
        case `withdraw`:
        case `settings`:
        case `privatekey`: {
            commands[interaction.commandName](interaction);
            break;
        }
    }
});

// General error handling
process.on(`uncaughtException`, async (error) => {
    console.log(`uncaughtException: ${error.message}`);
});

process.on(`unhandledRejection`, async (error) => {
    console.log(`unhandledRejection: ${error}`);
});

bot.on(`disconnected`, async () => {
    console.log(`Disconnected.`);
    process.exit(1);
});

bot.on(`error`, async (error) => {
    console.log(`Discord bot error: ${error}`);
    process.exit(1);
});

// Login the bot
bot.login(config.discord.token);
