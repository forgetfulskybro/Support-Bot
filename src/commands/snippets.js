const { EmbedBuilder, SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const Snippet = require("../util/models/snippet.js");

module.exports = {
    category: "Modmail",
    data: new SlashCommandBuilder()
        .setName('snippets')
        .setDescription('Command for viewing, adding, and removing snippets for the ticket system.')
        .addStringOption(option => option
            .setName('type')
            .setDescription('Provide which type you want to use for this command.')
            .setRequired(true)
            .addChoices(
                { name: 'Add', value: 'add' },
                { name: 'View', value: 'view' },
                { name: 'Remove', value: 'remove' },
            )
        ),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.guild) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You have to be in a channel to run this command!` })
        if (!interaction.member.roles.cache.has(client.config.supportRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be apart of our support team to access this command!` })
        switch (interaction.options._hoistedOptions[0].value) {
            case "add": {
                const modalObject = {
                    title: 'Creating Snippet',
                    custom_id: 'modal',
                    components: [{
                        type: 1,
                        components: [{
                            type: 4,
                            style: 1,
                            min_length: 2,
                            max_length: 50,
                            required: true,
                            custom_id: 'input',
                            label: 'Name',
                            placeholder: 'Add text to be the name of the snippet.'
                        }]
                    }, {
                        type: 1,
                        components: [{
                            type: 4,
                            style: 2,
                            min_length: 10,
                            max_length: 2000,
                            required: true,
                            custom_id: 'input2',
                            label: 'Description',
                            placeholder: 'Add text to be the description for this snippet.'
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
                        let input2 = modalInteraction.components[1].components[0].value;

                        const snipp = await Snippet.findOne({
                            keyword: input
                        })
                        if (snipp) return modalInteraction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} A snippet with name \`${input}\` already exists!` })

                        modalInteraction.reply({
                            ephemeral: true,
                            content: `${client.config.emojis.greenTick} Successfully created snippet \`${input}\`!`
                        })

                        await (new Snippet({
                            keyword: input,
                            content: input2
                        }).save());
                    }).catch(() => {
                        return
                    })
                break;
            }

            case "view": {
                class Paginator {
                    constructor(pages = [], {
                        filter,
                        timeout
                    } = {
                            timeout: 5 * 6e4
                        }) {
                        this.pages = Array.isArray(pages) ? pages : [];
                        this.timeout = Number(timeout) || 5 * 6e4;
                        this.page = 0;
                    }

                    add(page) {
                        this.pages.push(page);
                        return this;
                    }

                    setEndPage(page) {
                        if (page) this.endPage = page;
                        return this;
                    }

                    setTransform(fn) {
                        const _pages = [];
                        let i = 0;
                        const ln = this.pages.length;
                        for (const page of this.pages) {
                            _pages.push(fn(page, i, ln));
                            i++;
                        }
                        this.pages = _pages;
                        return this;
                    }

                    async start(channel, buttons) {
                        if (!this.pages.length) return;
                        const msg = await channel.reply({
                            embeds: [this.pages[0]],
                            components: [buttons],
                            ephemeral: true
                        });
                        const collector = msg.createMessageComponentCollector();

                        collector.on('collect', async (inter) => {
                            try {
                                if (inter.isButton()) {
                                    if (!inter) return;

                                    switch (inter.customId) {
                                        case "first":
                                            if (this.page === 0) {
                                                return await inter.reply({
                                                    ephemeral: true,
                                                    content: `${client.config.emojis.redTick} You can't procceed that way anymore!`
                                                });
                                            } else {
                                                await inter.update({
                                                    embeds: [this.pages[0]],
                                                    ephemeral: true
                                                });
                                                return this.page = 0;
                                            }
                                        case "prev":
                                            if (this.pages[this.page - 1]) {
                                                return await inter.update({
                                                    embeds: [this.pages[--this.page]],
                                                    ephemeral: true
                                                });
                                            } else {
                                                return await inter.reply({
                                                    ephemeral: true,
                                                    content: `${client.config.emojis.redTick} You can't procceed that way anymore!`
                                                });
                                            }
                                        case "next":
                                            if (this.pages[this.page + 1]) {
                                                return await inter.update({
                                                    embeds: [this.pages[++this.page]],
                                                    ephemeral: true
                                                });
                                            } else {
                                                return await inter.reply({
                                                    ephemeral: true,
                                                    content: `${client.config.emojis.redTick} You can't procceed that way anymore!`
                                                });
                                            }
                                        case "last":
                                            if (this.page === this.pages.length - 1) {
                                                return await inter.reply({
                                                    ephemeral: true,
                                                    content: `${client.config.emojis.redTick} You can't procceed that way anymore!`
                                                });
                                            } else {
                                                await inter.update({
                                                    embeds: [this.pages[this.pages.length - 1]],
                                                    ephemeral: true
                                                });
                                                return this.page = this.pages.length - 1;
                                            }
                                    }
                                }
                            } catch (e) {
                                return;
                            }
                        });
                    }
                }

                const snipp = await Snippet.find();
                if (snipp.length === 0) return interaction.reply({ ephemeral:true, content: `${client.config.emojis.redTick} There's currently no snippets to be displayed! You can create some by using \`/snippets add\`` })
                const page = new Paginator([], {})

                let data;
                data = snipp.map(
                    (s, i) =>
                        `**Name**: ${s.keyword}\n**Desc**: ${s.content.slice(0, 1000)}`
                );
                data = Array.from({
                    length: Math.ceil(data.length / 3)
                },
                    (a, r) => data.slice(r * 3, r * 3 + 3)
                );

                Math.ceil(data.length / 3);
                data = data.map(e => page.add(new EmbedBuilder().setTitle("Viewing Snippets").setDescription(`${e.slice(0, 3).join("\n\n").toString()}`)))

                page.setTransform((embed, index, total) => embed.setFooter({
                    text: `Would You Support | Page ${index + 1} / ${total}`,
                    iconURL: client.user.avatarURL()
                }))

                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('first')
                            .setLabel('⏪')
                            .setStyle('Primary'),
                        new ButtonBuilder()
                            .setCustomId('prev')
                            .setLabel('◀️')
                            .setStyle('Success'),
                        new ButtonBuilder()
                            .setCustomId('next')
                            .setLabel('▶️')
                            .setStyle('Success'),
                        new ButtonBuilder()
                            .setCustomId('last')
                            .setLabel('⏩')
                            .setStyle('Primary'),
                    );

                page.start(interaction, buttons)

                break;
            }

            case "remove": {
                if (!interaction.member.roles.cache.has(client.config.developerRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be a developer to use this sub-command! Contact one if you need a snippet deleted.` })

                const modalObject = {
                    title: 'Creating Snippet',
                    custom_id: 'modal',
                    components: [{
                        type: 1,
                        components: [{
                            type: 4,
                            style: 1,
                            min_length: 2,
                            max_length: 35,
                            required: true,
                            custom_id: 'input',
                            label: 'Name',
                            placeholder: 'Provide which snippet you want to use.'
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

                        const snipp = await Snippet.findOneAndDelete({
                            keyword: input
                        })
                        if (!snipp) return modalInteraction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} Snippet \`${input}\` doesn't exist to delete!` })

                        modalInteraction.reply({
                            ephemeral: true,
                            content: `${client.config.emojis.greenTick} Successfully deleted snippet \`${input}\`!`
                        })
                    }).catch(() => {
                        return
                    })
                break;
            }
        }

    },
};
