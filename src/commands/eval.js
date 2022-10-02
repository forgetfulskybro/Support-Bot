const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
module.exports = {
    category: "Developer",
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Evaluates code')
        .addStringOption((option) => option
            .setName('code')
            .setDescription('Provide code to be used.')),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.member.roles.cache.has(client.config.developerRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be apart of the developer team to access this command!` })

        try {
            let codein = interaction.options.getString("code");
            if (!codein) return interaction.reply({ ephemeral: true, content: "Send me code you loser." })
            if (codein === 'client.token') {
                return interaction.reply({ ephemeral: true, content: `${client.config.emoji.greenTick} Here you go: \`VMEZ7lr/R0lqHtDJ85+ar2VIEK8gevAIoP/in4YKozVd/gz6rqpAGMuBuj3kB6d01Bfu5mVeX/Vg5QEEwvTRdw==\`` })
            };
            let code = await eval(codein);
            if (typeof code !== 'string')
                code = require('util').inspect(code, {
                    depth: 0
                });

            interaction.reply({ ephemeral: true, content: `\`\`\`js\n${code.slice(0, 2000)}\n\`\`\`` })
        } catch (e) {
            interaction.reply({ ephemeral: true, content: `\`\`\`js\n${e.message.slice(0, 2000)}\n\`\`\`` });
        }
    },
};
