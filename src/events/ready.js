const {
  EmbedBuilder,
  ButtonBuilder,
  ActionRowBuilder
} = require("discord.js");
const Giveaway = require("../util/models/giveaway.js");

const { REST } = require('@discordjs/rest');
const { Routes, ActivityType } = require('discord-api-types/v10');
const { readdirSync } = require('fs');
require('dotenv').config();
const { ChalkAdvanced } = require('chalk-advanced');

module.exports = async (client) => {
  const commandFiles = readdirSync('./src/commands/').filter((file) => file.endsWith('.js'));

  const commands = [];

  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
  }

  const rest = new REST({
    version: '10',
  }).setToken(process.env.TOKEN);

  (async () => {
    try {
      await rest.put(Routes.applicationCommands(client.user.id), {
        body: commands,
      });
      console.log(
        `${ChalkAdvanced.white('Would You?')} ${ChalkAdvanced.gray(
          '>',
        )} ${ChalkAdvanced.green(
          'Successfully registered commands globally',
        )}`,
      );
    } catch (err) {
      if (err) console.error(err);
    }
  })();

  setInterval(() => {
    client.user.setActivity("for new tickets", { type: ActivityType.Watching })
    client.user.setPresence({ status: "dnd" })
  }, 30000);


  setInterval(async () => {
    let giveaways = await Giveaway.find();
    giveaways.map(async db => {
      if (db.ended) return;
      let set = db.now;
      let timeout = db.time;
      let endDate = Date.now();
      if (set - (Date.now() - timeout) <= 0) {
        const giveEmbed = new EmbedBuilder()
          .setColor("#E74D3C")
          .setAuthor({
            name: `Giveaway`,
            iconURL: client.guilds.cache.get(client.config.staffGuild).iconURL()
          })
          .setDescription(`**No one entered into the giveaway so I couldn't pick a winner**`)
          .addFields([{ name: "Ended", value: `<t:${Math.floor((endDate) / 1000)}:R>`, inline: true },
          { name: "Prize", value: `${db.prize}`, inline: true },
          { name: "Winner(s)", value: `none`, inline: false }])

        if (db.users.length === 0) {
          client.guilds.cache.get(client.config.staffGuild).channels.cache.get(client.config.giveaway).messages.fetch({ message: db.msgId }).then(m => m.edit({
            embeds: [giveEmbed],
            components: []
          }));
          return await db.delete();
        }

        if (db.picking.length === 0) {
          client.guilds.cache.get(client.config.staffGuild).channels.cache.get(client.config.giveaway).messages.fetch({ message: db.msgId }).then(m => m.edit({
            embeds: [giveEmbed],
            components: []
          }));
          return await db.delete();
        }

        for (let i = 0; i < db.winners; i++) {
          let winner = db.picking[Math.floor(Math.random() * db.picking.length)];

          const filtered = db.picking.filter(object => object.userID != winner.user.id)
          db.picking = filtered;

          db.pickedWinners.push({
            id: winner.user.id,
            user: winner.user
          })

          await db.save()
        }

        const buttons = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('claim')
              .setLabel('Claimed')
              .setStyle('Success'),
            new ButtonBuilder()
              .setCustomId('entries')
              .setLabel('Entries')
              .setStyle('Secondary'),
            new ButtonBuilder()
              .setCustomId('reroll')
              .setLabel('Reroll')
              .setStyle('Danger'),
          );

        const successEmbed = new EmbedBuilder()
          .setColor("#E74D3C")
          .setAuthor({
            name: `Giveaway`,
            iconURL: client.guilds.cache.get(client.config.staffGuild).iconURL()
          })
          .setDescription(`**The giveaway has ended**`)
          .addFields([{ name: "Ended", value: `<t:${Math.floor((endDate) / 1000)}:R>`, inline: true },
          { name: "Prize", value: `${db.prize}`, inline: true },
          { name: "Winner(s)", value: `${db.pickedWinners.map(w => `<@${w.user.id}> (\`${w.user.id}\`)`).join(", ")}`, inline: false }])

        client.guilds.cache.get(client.config.staffGuild).channels.cache.get(client.config.giveaway).send(`${db.pickedWinners.map(w => `<@${w.user.id}>`).join(", ")}`).then(m => setTimeout(async () => {
          m.delete()
        }, 2500)).catch(() => {
          return;
        })
        client.guilds.cache.get(client.config.staffGuild).channels.cache.get(client.config.giveaway).messages.fetch({ message: db.msgId }).then(m => m.edit({
          embeds: [successEmbed],
          components: [buttons]
        }))

        await db.updateOne({
          ended: true,
          endDate: endDate
        })
      }
    });
  }, 5000)
};
