const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
const Snippet = require('../util/models/snippet.js');
const Message = require("../util/models/message.js");
module.exports = {
    category: "Modmail",
    data: new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send messages to thread users.')
        .addStringOption((option) => option
            .setName('message')
            .setDescription('Provide text to send to the recipient.'))
        .addStringOption((option) => option
            .setName('snippet')
            .setDescription('Provide a snippet to be sent to the recipient.'))
        .addAttachmentOption(option => option
            .setName('image')
            .setDescription('Provide an image to be sent to the recipient.')
        ),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.guild) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You have to be in a recipient's channel to run this command!` })
        if (!interaction.member.roles.cache.has(client.config.supportRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be apart of our support team to access this command!` })

        const recipientThread = await Thread.findOne({
            channel: interaction.channel.id,
            closed: false
        });
        if (!recipientThread) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} There's no concurring thread in this channel!` })

        let type;
        if (interaction.member.roles.cache.has(client.config.developerRole)) {
            type = "Developer";
        } else if (interaction.member.roles.cache.has(client.config.supportRole)) { 
            type = "Support"
        }

        if (!interaction.guild.members.cache.get(recipientThread.recipient)) return interaction.reply({ ephemeral: true, content: `Recipient for this thread couldn't be found. They most likely left the server.` })
        const user = client.users.cache.get(recipientThread.recipient);

        let userEmbed = new EmbedBuilder()
            .setAuthor({ name: type, iconURL: client.user.displayAvatarURL() })
            .setColor("#0598F7")
            .setFooter({
                text: "Support",
                iconURL: interaction.guild.iconURL({ dynamic: true })
            });

        let chanEmbed = new EmbedBuilder()
            .setAuthor({ name: type, iconURL: client.user.displayAvatarURL() })
            .setColor("#0598F7")
            .setFooter({
                text: `${interaction.user.username}#${interaction.user.discriminator}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true })
            });

        if (interaction.options.getString("message") && interaction.options.getString("message").length > 0 && interaction.options.getString("snippet") && interaction.options.getString("snippet").length > 0) return interaction.reply({ ephemeral: true, content: "Please only provide whether `snippet` or `message`, not both when sending a message to the recipient." })
        let msg;
        if (interaction.options.getString("snippet") && interaction.options.getString("snippet").length > 0) {
            const snippt = await Snippet.findOne({
                keyword: interaction.options.getString("snippet")
            });

            if (!snippt) return interaction.reply({ ephemeral: true, content: "The provided snippet wasn't found. Check all snippets using `/snippets view`" })
            userEmbed.setDescription(snippt.content)
            chanEmbed.setDescription(snippt.content)
            msg = snippt.content;
        }

        if (interaction.options.getString("message") && interaction.options.getString("message").length > 0) {
            userEmbed.setDescription(interaction.options.getString("message"))
            chanEmbed.setDescription(interaction.options.getString("message"))
        }

        if (interaction.options.get("image")) {
            let types = ["png", "gif", "webp", "jpg", "jpeg"]
            if (!types.includes(interaction.options.get("image").attachment.contentType.replace("image/", ""))) return interaction.reply({ ephemeral: true, content: "Provide a valid image that ends with: `png`, `jpg`, `gif`, or `webp`" })

            userEmbed.setImage(interaction.options.get("image").attachment.proxyURL)
            chanEmbed.setImage(interaction.options.get("image").attachment.proxyURL)
        }

        if (!interaction.options.getString("message") && !interaction.options.getString("snippet") && !interaction.options.get("image")) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} When sending a message, you must provide either a message, snippet name, or image!` })

        const messageID = (await Message.countDocuments({
            thread: recipientThread.id
        })) + 1;

        await (new Message({
            thread: recipientThread.id,
            message: messageID,
            recipient: 'Support Operator',
            channel: interaction.channel.id,
            content: msg ? msg : interaction.options.getString("message") ? interaction.options.getString("message") : "~~No Content~~",
            author: interaction.user.id,
            attachments: interaction.options.get("image") ? interaction.options.get("image").attachment.proxyURL : [],
            timestamp: Date.now()
        }).save());

        interaction.reply({ embeds: [chanEmbed] }).catch(() => { })
        user.send({ embeds: [userEmbed] }).catch(() => {
            return interaction.channel.send({ content: `${client.config.emojis.redTick} The user either turned off their DMs or left the server. I won't be able to DM them.` })
        })
    },
};
