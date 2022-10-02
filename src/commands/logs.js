const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const Thread = require('../util/models/thread.js');
const Messages = require("../util/models/message.js");
module.exports = {
    category: "Modmail",
    data: new SlashCommandBuilder()
        .setName('logs')
        .setDescription('Show logs of specific thread cases.')
        .addStringOption((option) => option
            .setName('case')
            .setRequired(true)
            .setDescription('Provide a case number to view information about that thread.')),

    /**
     * @param {CommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if (!interaction.guild) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You have to be in a channel to run this command!` })
        if (!interaction.member.roles.cache.has(client.config.supportRole)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} You must be apart of our support team to access this command!` })

        const ID = interaction.options.getString("case");
        if (isNaN(ID)) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} Provided thread ID was invalid!` });
        const msgs = await Messages.find({
            thread: ID
        });
        if (msgs.length === 0) return interaction.reply({ ephemeral: true, content: `${client.config.emojis.redTick} Provided thread ID has no messages to be displayed!` });
        const thread = await Thread.findOne({
            id: ID
        });
        if (thread.admin && !interaction.member.roles.cache.has(client.config.developerRole)) return interaction.reply({ ephemeral: true, content: `That thread was locked for only developers to view!` })

        const threadRecipient = await client.users.fetch(thread.recipient);

        let out = `=== Thread Details ===
Thread ID: ${thread.id}
Recipient: ${threadRecipient.tag} (ID: ${threadRecipient.id})
Issue: ${thread.issue}
Created At: ${new Date(thread.timestamp).toLocaleString()}

=== Messages ===

`;

        for (const m of msgs) {
            const ma = await client.users.fetch(m.author);


            let fetchedContent = `@ ${ma.tag} (ID: ${m.author}) ${new Date(m.timestamp).toLocaleString()}
- Content: ${m.content}
`; 
            for (const at of m.attachments) {
                fetchedContent += `> Attachment: ${at}`;
            }

            out += `${fetchedContent}

`;
        }

        interaction.reply({
            ephemeral: true,
            content: `${client.config.emojis.greenTick} Thread **#${thread.id}** Details:`,
            files: [{
                attachment: Buffer.from(out),
                name: `ticket_${thread.id}_details.txt`
            }]
        });
    },
};
