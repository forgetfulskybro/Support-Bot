const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Blacklist = require('../util/models/blocked.js');
const Thread = require('../util/models/thread.js');

module.exports = {
    category: "General",
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Starts a modmail ticket.')
        .addStringOption((option) => option
            .setName('message')
            .setDescription('Provide your issue briefly.')
            .setRequired(true)),
    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (interaction.guild) return interaction.reply({ ephemeral: true, content: "To start a modmail ticket, run this command in your DM's." })
        const block = await Blacklist.findOne({
            block: interaction.user.id
        })
        if (block) return interaction.reply({ ephemeral: true, content: "You don't have access to create tickets. This could be from abusing our system or harrassment. " })

        const haveThread = await Thread.findOne({
            recipient: interaction.user.id,
            closed: false
        });
        if (haveThread) return interaction.reply("You already have an ongoing thread. You can't create multiple tickets!");

        const channel = await client.guilds.cache.get(client.config.staffGuild).channels.create({
            name: `${interaction.user.username}-${interaction.user.discriminator}`,
            type: 0,
            topic: `User: ${interaction.user.username}#${interaction.user.discriminator} (ID: ${interaction.user.id})\n\nIssue: ${interaction.options.getString('message').slice(0, 100)}`,
            nsfw: false,
            parent: client.config.parent,
            permissionOverwrites: [{
                id: client.config.staffGuild,
                deny: ["ViewChannel"],
                type: "role"
            },
            {
                id: client.config.supportRole,
                allow: ["ViewChannel"],
                type: "role"
            }
            ]
        });

        const infoEmbed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.username}#${interaction.user.discriminator}`,
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(`**${interaction.user.username}#${interaction.user.discriminator}** (ID: ${interaction.user.id}) has opened a ticket.\nAccount was created ${fetchTime(Date.now() - interaction.user.createdTimestamp)} ago.`)
            .addFields({ name: "Issue:", value: interaction.options.getString('message').toString() })
            .setColor("#F00605")
            .setTimestamp();

        await channel.send({
            content: `<@&${client.config.supportRole}>`,
            embeds: [infoEmbed]
        });

        var threadID = await Thread.countDocuments();
        threadID += 1;

        await (new Thread({
            id: threadID,
            recipient: interaction.user.id,
            channel: channel.id,
            guild: channel.guild.id,
            issue: interaction.options.getString('message'),
            timestamp: Date.now()
        }).save());

        const start = new EmbedBuilder()
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.avatarURL({
                    format: 'png'
                })
            })
            .setDescription('A ticket has been started and a support member will get to you soon!\nThanks for your patience \n\n Cheers!\n **Would You Support**')
            .setColor("#F00605")
        return interaction.reply({
            embeds: [start]
        });

    },
};

function fetchTime(ms, object = false) {
    var totalSeconds = (ms / 1000);
    let years = Math.floor(totalSeconds / 31536000);
    totalSeconds %= 31536000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    seconds = Math.floor(seconds);
    if (object === true) return {
        years,
        days,
        hours,
        minutes,
        seconds
    };

    return `${years} year(s), ${days} day(s), ${hours} hour(s), ${minutes} minute(s) and ${seconds} second(s)`;
}
