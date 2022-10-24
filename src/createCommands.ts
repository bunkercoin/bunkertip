// Import packages
import Discord from "discord.js";

export default async (commands: Discord.ApplicationCommandManager | undefined) => {
    await commands?.create({
        name: `balance`,
        description: `Returns your balance`,
        options: [
            {
                name: `user`,
                description: `The user to check the balance of`,
                type: `USER`,
            },
        ],
    });

    await commands?.create({
        name: `deposit`,
        description: `Deposit Bunkercoins to your balance`,
    });

    await commands?.create({
        name: `privatekey`,
        description: `Returns your private key`,
    });

    await commands?.create({
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

    await commands?.create({
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

    await commands?.create({
        name: `settings`,
        description: `Change your settings`,
        options: [
            {
                name: `key`,
                description: `The key to change`,
                type: `STRING`,
                required: true,
                choices: [
                    {
                        name: `Share Balance`,
                        value: `sharesBalance`,
                    },
                ],
            },
            {
                name: `value`,
                description: `The value to set the key to`,
                type: `BOOLEAN`,
                required: true,
            },
        ],
    });

	await commands?.create({
        name: `phrasedrop`,
        description: `Claim your Bunkercoins from the phrasedrop`,
        options: [
            {
                name: `phrase`,
                description: `The phrase to claim your Bunkercoins from`,
                type: `STRING`,
                required: true,
            },
        ],
    });
};
