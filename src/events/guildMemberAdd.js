const { EmbedBuilder } = require('discord.js');
const colors = ["#0C94EB", "#ED0703"]
module.exports = async (client, guildMemberAdd) => {
    const color = colors[Math.floor(Math.random() * colors.length)]
    const channel = guildMemberAdd.guild.channels.cache.get(client.config.joins);
    const embed = new EmbedBuilder()
        .setAuthor({ name: `${guildMemberAdd.user.username}#${guildMemberAdd.user.discriminator}`, iconURL: guildMemberAdd.user.displayAvatarURL({ dynamic: true }) })
        .setDescription(`Welcome ${guildMemberAdd.user.username}#${guildMemberAdd.user.discriminator} to **Would You Support**! This server is the support server for <@981649513427111957> where you can do anything relating to Would You.\n\n**Important Channels**\n<#1018311140012478474>\n<#1009932624728440842>\n<#1009932614024568842>\n<#1023559206672007229>\n\nWe now have **${guildMemberAdd.guild.memberCount}** members!`)
        .setColor(color);

    channel.send({ content: guildMemberAdd, embeds: [embed] });
};
