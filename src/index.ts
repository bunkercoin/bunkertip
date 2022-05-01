// Import config
import config from "../config.js";

// Import packages
import Discord, { Intents } from "discord.js";
const bot = new Discord.Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

// Helper functions
import { rpc } from "./helper.js";

bot.on(`ready`, () => {
    // Log that the bot is ready
    console.log(`Logged in as ${bot.user?.tag}!`);

    // Create the slash commands
    const commands = bot.application?.commands;

    commands?.create({
        name: `balance`,
        description: `Returns your balance`,
    });

    commands?.create({
        name: `deposit`,
        description: `Deposit Bunkercoins to your balance`,
    });

    commands?.create({
        name: `privatekey`,
        description: `Returns your private key`,
    });

    commands?.create({
        name: `withdraw`,
        description: `Withdraw Bunkercoins from your balance`,
        options: [
            {
                name: `amount`,
                description: `The amount of Bunkercoins to withdraw`,
                type: `NUMBER`,
                required: true,
            },
            {
                name: `address`,
                description: `The address to send the Bunkercoins to`,
                type: `STRING`,
                required: true,
            },
        ],
    });

    commands?.create({
        name: `tip`,
        description: `Tip a user`,
        options: [
            {
                name: `user`,
                description: `The user to tip`,
                type: `USER`,
                required: true,
            },
            {
                name: `amount`,
                description: `The amount of Bunkercoins to tip`,
                type: `NUMBER`,
                required: true,
            },
        ],
    });
});

bot.on(`interactionCreate`, async (interaction) => {
    if (!interaction.isCommand() || interaction.user.bot) return;

    await interaction.deferReply({
        ephemeral: interaction.channel?.id !== undefined,
    });

    const { commandName, options } = interaction;

    const userID = interaction.user.id;

    switch (commandName) {
        case `balance`: {
            // Get the user's balance
            const balance = await rpc(`getbalance`, [userID]);
            if (balance[0]) {
                await interaction.editReply({
                    content: `An error occured while fetching your balance`,
                });
                break;
            }

            await interaction.editReply({
                content: `You currently have ${JSON.stringify(balance[1])} BKC`,
            });
            break;
        }

        case `deposit`: {
            // Check if the user has a wallet
            const hasWallet = await rpc(`getaddressesbyaccount`, [userID]);
            if (hasWallet[0]) {
                await interaction.editReply({
                    content: `An error occured while generating a new deposit address`,
                });
                break;
            }

            // If the user already has a wallet
            if (hasWallet[1].length > 0) {
                await interaction.editReply({
                    content: `Your deposit address is ${hasWallet[1][0]}`,
                });
                break;
            }
            // If the user doesn't have a wallet yet
            else {
                const newAddress = await rpc(`getnewaddress`, [userID]);
                if (newAddress[0]) {
                    await interaction.editReply({
                        content: `An error occured while generating a new deposit address`,
                    });
                    break;
                }

                // Reply with the new address
                await interaction.editReply({
                    content: `Your new deposit address is ${newAddress[1]}`,
                });
                break;
            }
        }

        case `privatekey`: {
            // Check if the user has a wallet
            const hasWallet = await rpc(`getaddressesbyaccount`, [userID]);
            if (hasWallet[0]) {
                await interaction.editReply({
                    content: `An error occured while dumping your private key`,
                });
                break;
            }

            // If the user already has a wallet
            if (hasWallet[1].length > 0) {
                // Dump the private key
                const privateKey = await rpc(`dumpprivkey`, [hasWallet[1][0]]);
                if (privateKey[0]) {
                    await interaction.editReply({
                        content: `An error occured while dumping your private key`,
                    });
                    break;
                }

                // Reply with the private key
                await interaction.editReply({
                    content: `Your private key is ${privateKey[1]}`,
                });
                break;
            }
            // If the user doesn't have a wallet yet
            else {
                const newAddress = await rpc(`getnewaddress`, [userID]);
                if (newAddress[0]) {
                    await interaction.editReply({
                        content: `An error occured while dumping your private key`,
                    });
                    break;
                }

                // Dump the private key
                const privateKey = await rpc(`dumpprivkey`, [newAddress[1]]);
                if (privateKey[0]) {
                    await interaction.editReply({
                        content: `An error occured while dumping your private key`,
                    });
                    break;
                }

                // Reply with the private key
                await interaction.editReply({
                    content: `Your private key is ${privateKey[1]}`,
                });
                break;
            }
        }

        case `withdraw`: {
            // Parse the amount and address
            const amount = options.getNumber(`amount`);
            const address = options.getString(`address`);

            // Make sure both values were provided
            if (!amount || !address) {
                await interaction.editReply({
                    content: `Please provide an amount and address`,
                });
                break;
            }

            // Validate the address
            if (!/^[B][a-zA-Z0-9]{33}$/.test(address)) {
                await interaction.editReply({
                    content: `Please provide a valid address`,
                });
                break;
            }

            // Fetch the user's balance
            const balance = await rpc(`getbalance`, [userID]);
            if (balance[0]) {
                await interaction.editReply({
                    content: `An error occured while fetching your balance`,
                });
                break;
            }

            // Check if the user has enough balance
            if (balance[1] < amount) {
                await interaction.editReply({
                    content: `You don't have enough balance`,
                });
                break;
            }

            // Withdraw the amount
            const result = await rpc(`sendfrom`, [userID, address, amount]);
            if (result[0]) {
                await interaction.editReply({
                    content: `An error occured while creating the transaction`,
                });
                break;
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
            break;
        }

        case `tip`: {
            // Parse the user to tip and the amount
            const toTip = options.getUser(`user`);
            const amount = options.getNumber(`amount`);

            // Make sure both values were provided
            if (!toTip || !amount) {
                await interaction.editReply({
                    content: `Please provide a user to tip and an address`,
                });
                break;
            }

            // Make sure the to get tipped user isn't a bot nor the user itself
            if (toTip.bot || toTip.id === userID) {
                await interaction.editReply({
                    content: `You can't tip yourself or a bot`,
                });
                break;
            }

            // Fetch the user's balance
            const balance = await rpc(`getbalance`, [userID]);
            if (balance[0]) {
                await interaction.editReply({
                    content: `An error occured while fetching your balance`,
                });
                break;
            }

            // Check if the user has enough balance
            if (balance[1] < amount) {
                await interaction.editReply({
                    content: `You don't have enough balance`,
                });
                break;
            }

            // Make the tip
            const result = await rpc(`move`, [userID, toTip.id, amount]);
            if (result[0]) {
                await interaction.editReply({
                    content: `An error occured while moving the funds`,
                });
                break;
            }

            // Inform the user the tip was successful
            await interaction.editReply({
                content: `Success! ${amount} BKC has been sent to ${toTip.tag}`,
            });

            // DM the user the tip if their DM is open
            interaction.channel?.id
                ? interaction.user
                      .send({
                          content: `Success! ${amount} BKC has been sent to ${toTip.tag}`,
                      })
                      .catch(() => {})
                : null;

            // Inform the to get tipped user of the tip
            toTip
                .send({
                    content: `You have been tipped ${amount} BKC by ${interaction.user.tag} (${userID})`,
                })
                .catch(() => {});
        }
    }
});

bot.login(config.discord.token);
