// Import packages
import Discord from "discord.js";

export default (commands: Discord.ApplicationCommandManager | undefined) => {
    commands?.create({
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
};
