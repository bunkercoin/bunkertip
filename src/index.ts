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
    // Make sure it's a command and not used by a bot
    if (!interaction.isCommand() || interaction.user.bot) return;

    // Defer the reply to avoid Unknown reply error
    await interaction.deferReply({
        ephemeral: interaction.channel?.id !== undefined,
    });

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

bot.login(config.discord.token);
