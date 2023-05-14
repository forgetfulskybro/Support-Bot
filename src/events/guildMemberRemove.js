const Thread = require("../util/models/thread.js");
const { EmbedBuilder } = require("discord.js");
module.exports = async (client, member) => {
    const recipientThread = await Thread.findOne({
        recipient: member.user.id,
        closed: false
      });
  
      if (recipientThread) {
        const embed = new EmbedBuilder()
          .setAuthor({
            name: member.user.tag,
            iconURL: member.user.avatarURL({
              dynamic: true,
              format: 'png'
            })
          })
          .setDescription(`${client.config.emojis.redTick} User has left the server.`)
          .setColor("#E74D3C")
          .setTimestamp();
  
        const channel = client.channels.cache.get(recipientThread.channel);
        channel.send({ embeds: [embed] })
      }
};
