const Thread = require("../models/thread.js");
const Message = require("../models/message.js");
const Blacklist = require("../models/blocked.js");
const Discord = require("discord.js");

class Threading {
  static async message(client, message) {
    const black = await Blacklist.findOne({
      block: message.author.id
    })
    if (black) return;
    if (message.author.bot) return;
    if (message.channel.type === 1) {
      const recipientThread = await Thread.findOne({
        recipient: message.author.id,
        closed: false
      });

      if (!recipientThread) return message.channel.send(`Hello! If you wish to start a new ticket, please use \`/start\`.`).then(msg => {
        setTimeout(() => msg.delete(), 5000)
      })


      this.dm(client, message, recipientThread);
    }
  }

  static async dm(client, message, thread) {
    const channel = client.channels.cache.get(thread.channel);
    if (!channel) message.channel.send(`${this.client.config.emojis.redTick} Channel for thread ${thread.id} can not be found.`);

    if (!message) {
      return await message.react(client.config.emojis.redTick.replace("<:BadCheck:", "").replace(">", "")).catch(() => { })
    }

    message.attachments.map(async attachment => {
      const embed = new Discord.EmbedBuilder()
        .setAuthor({
          name: message.author.tag,
          iconURL: message.author.avatarURL({
            dynamic: true,
            format: 'png'
          })
        })
        .setColor("#F00605")
        .setImage(attachment.proxyURL)
        .setTimestamp();

      async function Subscribed() {

        let subbing;
        let subb;
        subbing = `<@${thread.sub}>, the recipient replied.`
        if (subbing.includes('none')) {
          subb = subbing.replace('<@none>, the recipient replied.', 'Recipient replied.')
        } else {
          subb = `<@${thread.sub}>, the recipient replied.`
        }

        const messageID = (await Message.countDocuments({
          thread: thread.id
        })) + 1;

        await (new Message({
          thread: thread.id,
          message: messageID,
          recipient: message.author.tag,
          channel: message.channel.id,
          content: "~~No Content~~",
          author: thread.recipient,
          attachments: message.attachments.map(a => a.proxyURL),
          timestamp: Date.now()
        }).save());

        await message.react(client.config.emojis.greenTick.replace("<:GoodCheck:", "").replace(">", ""));

        channel.send({
          content: subb,
          embeds: [embed]
        })
      }

      Subscribed()
    });

    if (!message.content) return;

    const contentEmbed = new Discord.EmbedBuilder()
      .setAuthor({
        name: message.author.tag,
        iconURL: message.author.avatarURL({
          dynamic: true,
          format: 'png'
        })
      })
      .setDescription(message.content || "~~No Content~~")
      .setColor("#F00605")
      .setTimestamp();

    async function Subscribed1() {
      let subbing;
      let subb;
      subbing = `<@${thread.sub}>, the recipient replied.`
      if (subbing.includes('none')) {
        subb = subbing.replace('<@none>, the recipient replied.', 'Recipient replied.')
      } else {
        subb = `<@${thread.sub}>, the recipient replied.`
      }
      channel.send({
        content: subb,
        embeds: [contentEmbed]
      })
    }

    Subscribed1()


    const messageID = (await Message.countDocuments({
      thread: thread.id
    })) + 1;

    await (new Message({
      thread: thread.id,
      message: messageID,
      recipient: message.author.tag,
      channel: message.channel.id,
      content: message.content,
      author: thread.recipient,
      attachments: message.attachments.map(a => a.proxyURL),
      timestamp: Date.now()
    }).save());

    await message.react(client.config.emojis.greenTick.replace("<:GoodCheck:", "").replace(">", ""));
  }
}

module.exports = Threading;