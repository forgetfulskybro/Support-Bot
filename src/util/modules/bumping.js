const { EmbedBuilder } = require("discord.js");

class Bumping {
    static async message(client, message) {
        if (!message.interaction) return;

        if (message.author.id === "302050872383242240" && message.interaction.commandName === "bump") {
            const user = message.interaction.user.id;

            const embed = new EmbedBuilder()
                .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setDescription(`Thank you, <@${user}> for supporting our server and bumping the bot!\nI'm setting a reminder for **2 hours** that'll announce the role <@&${client.config.bumpRole}>.\n\nIf you want to be mentioned for bumping, head into <#1023559206672007229>.`)
                .setColor("#FFBF40")

            message.fetch().catch(() => { });
            message.reply({ embeds: [embed] }).catch(() => { })

            let interval = setInterval(() => {
                const bumps = new EmbedBuilder()
                    .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setDescription(`Bumping for <@302050872383242240> is now available!\nRun </bump:1030222665241341974> to bump the server!`)
                    .setColor("#FFBF40")

                client.channels.cache.get(client.config.bump).send({ content: `<@&${client.config.bumpRole}>`, embeds: [bumps] });
                clear();
            }, 7200000)

            function clear() {
                clearInterval(interval)
            }
        }
    }
}

module.exports = Bumping;