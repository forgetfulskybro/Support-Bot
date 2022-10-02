const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
module.exports = {
    category: "General",
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Suggest a feature to be added to Would You.'),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.guild) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You have to be in the server to use this command!` })
        if (client.used.has(interaction.user.id)) return await interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You have to wait 3 hours before creating another suggestion!` }).catch(() => { });

        const modalObject = {
            title: 'Creating Suggestions',
            custom_id: 'modal',
            components: [{
                type: 1,
                components: [{
                    type: 4,
                    style: 2,
                    min_length: 5,
                    max_length: 2000,
                    required: true,
                    custom_id: 'input',
                    label: 'Suggestion',
                    placeholder: 'What do you want suggested?'
                }]
            }]
        }

        interaction.showModal(modalObject);
        interaction.awaitModalSubmit({
            filter: (mInter) => mInter.customId === modalObject.custom_id,
            time: 180000
        })
            .then(async (modalInteraction) => {
                let input = modalInteraction.components[0].components[0].value.toLowerCase();

                const webhooks = await modalInteraction.guild.channels.cache.get(client.config.suggests).fetchWebhooks();
                const webhook = webhooks.find(g => g.owner.id === client.user.id);
                const message = await webhook.send({
                    username: `${modalInteraction.user.username}#${interaction.user.discriminator}`,
                    avatarURL: modalInteraction.user.displayAvatarURL({ dynamic: true }),
                    content: input,
                    fetchReply: true
                })

                await message.react("1025490645525209148")
                await message.react("1025490660968628436")
                await message.startThread({ name: `${modalInteraction.user.username}'s Suggestion`, reason: `Suggestion thread for ${modalInteraction.user.username}` })

                modalInteraction.reply({ ephemeral: true, content: `${client.config.emojis.greenTick} Successfully created your suggestion!` })
                client.used.set(modalInteraction.user.id, Date.now() + 10800000)
                setTimeout(() => client.used.delete(modalInteraction.user.id), 10800000)
            }).catch(() => {
                return
            })
    },
};
