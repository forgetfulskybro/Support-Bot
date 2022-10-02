const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
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

module.exports = {
    category: "Modmail",
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Create\'s a ticket for support to get in contact with a user')
        .addUserOption((option) => option
            .setName("user")
            .setRequired(true)
            .setDescription("Provide a user you want to start a ticket with")),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.guild) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You have to be in a recipient's channel to run this command!` })
        if (!interaction.member.roles.cache.has(client.config.supportRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be apart of our support team to access this command!` })

        const target = interaction.options.get("user");
        const dm = client.users.cache.get(interaction.options.get('user').user.id)

        const haveThread = await Thread.findOne({
            recipient: target.user.id,
            closed: false
        });
        if (haveThread) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} A thread is already ongoing in <#${haveThread.channel}>.` });

        const issueEmbed = new EmbedBuilder()
            .setAuthor({
                name: client.user.username,
                iconURL: client.user.avatarURL({
                    format: 'png'
                })
            })
            .setDescription("**Ticket Opened!**\n\nHello, the support team has reached out to you. Any message you send in this DM will be forwarded to them. Please wait while we get messages ready to be sent, thanks for the patience!")
            .setColor("#0598F7")

        try {
            await dm.send({
                embeds: [issueEmbed]
            });
        } catch (e) {
            return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} Could not establish a DM, their DMs are closed.` });
        }

        const channel = await client.guilds.cache.get(client.config.staffGuild).channels.create({
            name: `${target.user.username}-${target.user.discriminator}`,
            type: 0,
            topic: `User: ${target.user.username}#${target.user.discriminator} (ID: ${target.user.id})\n\nThread started by the support team.`,
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
                name: client.user.username,
                iconURL: client.user.avatarURL({
                    format: 'png'
                })
            })
            .setDescription(`Support team (<@${interaction.user.id}>) has opened a ticket with **${target.user.username}#${target.user.discriminator}** (ID: ${target.user.id}).\n\nAccount was created ${fetchTime(Date.now() - target.user.createdTimestamp)} ago.`)
            .setColor("#0598F7")
            .setTimestamp();

        await channel.send({
            embeds: [infoEmbed]
        });

        var threadID = await Thread.countDocuments();
        threadID += 1;

        await (new Thread({
            id: threadID,
            recipient: target.user.id,
            channel: channel.id,
            guild: channel.guild.id,
            issue: "Support team opened this ticket.",
            timestamp: Date.now()
        }).save());

        interaction.reply(`${client.config.emojis.greenTick} The ticket has been created: ${channel}`);
    },
};
