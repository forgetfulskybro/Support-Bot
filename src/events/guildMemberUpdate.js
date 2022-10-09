const { EmbedBuilder } = require('discord.js');

module.exports = async (client, oldMember, newMember) => {
    if (!oldMember.premiumSince && newMember.premiumSince) {
        const channel = newMember.guild.channels.cache.get(client.config.joins);
        const embed = new EmbedBuilder()
            .setAuthor({ name: `${newMember.user.username}#${newMember.user.discriminator}`, iconURL: newMember.user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`Thank you ${newMember} for boosting our server!\nWe really appreciate you supporting our community.\n\nWe now have **${newMember.guild.premiumSubscriptionCount}** boosts!`)
            .setThumbnail("https://cdn.discordapp.com/attachments/945100320973934653/1028647944326500362/Wumpus.gif")
            .setColor("#FF73FA");
        
        channel.send({ embeds: [embed] });
    }
};
