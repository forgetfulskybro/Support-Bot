const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Giveaways = require('../util/models/giveaway.js');
const dhms = require("dhms");

module.exports = {
    category: "Developer",
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('Create giveaways')
        .addStringOption((option) => option
            .setName('time')
            .setRequired(true)
            .setDescription('Provide how much time you want the giveaway to last, example: 5h'))
        .addStringOption((option) => option
            .setName('winners')
            .setRequired(true)
            .setDescription('Provide how many winners there will be for this giveaway.'))
        .addStringOption((option) => option
            .setName('prize')
            .setRequired(true)
            .setDescription('Provide what the prize for the giveaway will be.')),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.guild) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You have to be in a channel to run this command!` })
        if (!interaction.member.roles.cache.has(client.config.developerRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be apart of the developer team to access this command!` })

        const time = interaction.options.getString("time");
        if (time) {
            if (Array.from({
                length: 59000
            }, (_, i) => i + 1).includes(dhms(time))) {
                return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} When making a giveaway, make sure to only provide \`days\`, \`hours\`, and \`minutes\` first before \`seconds\`.` })
            }
            if (!isNaN(time)) {
                return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} When making a giveaway, you need to provide \`d\`, \`h\`, \`m\` after the number.` })
            }
            if (time.includes("-")) {
                return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} When making a giveaway, only provide positive numbers.` })
            }
            if (Array.from({
                length: 299000
            }, (_, i) => i + 1).includes(dhms(time))) {
                return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} When making a giveaway, only make giveaways 5 minutes or longer.` })
            }
            if (dhms(time) === 0) {
                return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} When starting a giveaway, follow this format: \`/giveaway 12h 3 Toys\`` })
            }
        }

        const winners = interaction.options.getString("winners");
        if (winners === 0) {
            return interaction.reply(`${client.config.emojis.redTick} When making a giveaway, you need to specify how many winners for the giveaway.`).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            })
        }

        if (winners > 5) {
            return interaction.reply(`${client.config.emojis.redTick} When making a giveaway, make sure the amount of winners is below or equal to 5.`).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            })
        }

        if (isNaN(winners)) {
            return interaction.reply(`${client.config.emojis.redTick} When making a giveaway, you need to specify how many winners for the giveaway.`).then(msg => {
                setTimeout(() => msg.delete(), 5000);
            })
        }

        const prize = interaction.options.getString("prize");
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('jl')
                    .setLabel('Join/Leave')
                    .setStyle('Success'),
                new ButtonBuilder()
                    .setCustomId('entries')
                    .setLabel('Entries')
                    .setStyle('Secondary'),
                new ButtonBuilder()
                    .setCustomId('end')
                    .setLabel('End')
                    .setStyle('Danger'),
            );

        const embed = new EmbedBuilder()
            .setColor("#FFBF40")
            .setAuthor({
                name: `Giveaway`,
                iconURL: interaction.guild.iconURL()
            })
            .setDescription(`Click the \`Join\` button to join the giveaway.`)
            .addFields([{ name: "Time", value: `<t:${Math.floor((dhms(time) + Date.now()) / 1000)}:R>`, inline: true },
            { name: "Prize", value: `${prize}`, inline: true },
            { name: "Winners", value: `${winners}` }])
        const msg = await interaction.guild.channels.cache.get(client.config.giveaway).send({
            components: [buttons],
            embeds: [embed]
        })

        const giveaway = new Giveaways({
            msgId: msg.id,
            time: dhms(time),
            now: Date.now(),
            prize: prize,
            winners: winners,
        });

        giveaway.save();


        return interaction.reply({ ephemeral: true, content: `${client.config.emojis.greenTick} Successfully created your giveaway!` })

    },
};
