const { EmbedBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js")
const Giveaways = require('../util/models/giveaway.js');

const misc = [{
  name: "giveaway",
  id: "1025491165618897016"
}, {
  name: "announcement",
  id: "1025491018646310972"
}, {
  name: "changelog",
  id: "1025491057401667645"
}, {
  name: "bump",
  id: "1025491188167491704"
}, {
  name: "status",
  id: "1025699522791358534"
}]

let page;
let pages = [];

module.exports = async (client, interaction) => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
      command.execute(interaction, client);
    } catch (err) {
      if (err) console.error(err);
      interaction.reply({
        content: "Redo the command as there was an error.",
        ephemeral: true,
      });
    }
  } else if (interaction.isButton()) {
    if (client.buttons.has(interaction.user.id)) return interaction.reply({ ephemeral: true, content: "You have to wait 3 seconds between every button click!" }).catch(() => { });

    if (interaction.channel.id === client.config.giveaway) {
      const giveaway = await Giveaways.findOne({
        msgId: interaction.message.id
      });

      class Paginator {
        constructor(pages = []) {
          pages = Array.isArray(pages) ? pages : [];
          page = 0;
        }

        add(page) {
          pages.push(page);
          return this;
        }

        setTransform(fn) {
          const _pages = [];
          let i = 0;
          const ln = pages.length;
          for (const page of pages) {
            _pages.push(fn(page, i, ln));
            i++;
          }
          pages = _pages;
          return this;
        }

        async start(inter, buttons) {
          if (!pages.length) return;
          pages = pages;
          page = page;
          inter.reply({
            ephemeral: true,
            embeds: [pages[0].setFooter({
              text: `Page ${[page + 1]} / ${pages.length}`
            })],
            components: [buttons]
          }).catch(() => { })
        }
      }

      if (interaction.customId === "jl") {
        if (client.buttons.get(interaction.member.id)) return interaction.reply({
          content: `You need to wait before trying to join/leave a giveaway!`,
          ephemeral: true
        }).catch(() => { })

        if (giveaway.ended) return interaction.reply({
          content: `This giveaway has ended so you can't join/leave it.`,
          ephemeral: true
        }).catch(() => { })

        if (giveaway.users.map(u => u.userID).includes(interaction.member.id)) {
          const filtered = giveaway.users.filter(object => object.userID != interaction.member.id)
          giveaway.users = filtered;
          const filtered2 = giveaway.picking.filter(object => object.userID != interaction.member.id)
          giveaway.picking = filtered2;
          giveaway.save();

          client.buttons.set(interaction.member.id, Date.now() + 3000)
          setTimeout(() => client.buttons.delete(interaction.member.id), 3000)

          return interaction.reply({
            ephemeral: true,
            content: `You've successfully left this giveaway.`
          }).catch(() => { })
        } else {
          giveaway.users.push({
            userID: interaction.member.id,
            user: interaction.member.user
          });

          giveaway.picking.push({
            userID: interaction.member.id,
            user: interaction.member.user
          });

          giveaway.save();

          client.buttons.set(interaction.member.id, Date.now() + 3000)
          setTimeout(() => client.buttons.delete(interaction.member.id), 3000)

          return interaction.reply({
            ephemeral: true,
            content: `You've successfully joined this giveaway.`
          }).catch(() => { })
        }
      }

      if (interaction.customId === "entries") {
        if (giveaway.users.length === 0) return interaction.reply({
          ephemeral: true,
          content: "This giveaway doesn't have anyone to display yet."
        }).catch(() => { })

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

        const page = new Paginator([])

        let data;
        data = giveaway.users.map(
          (p, i) =>
            `**${String(++i)}**. ${p.user.username}#${p.user.discriminator}\n`
        );
        data = Array.from({
          length: Math.ceil(data.length / 5)
        },
          (a, r) => data.slice(r * 5, r * 5 + 5)
        );

        Math.ceil(data.length / 5);
        data = data.map((e, i) => page.add(new EmbedBuilder().setAuthor({
          name: `Giveaway Entries`,
          iconURL: interaction.guild.iconURL()
        }).setDescription(`${String(`**Total Participants**: ${giveaway.users.length}\n**Participants**: \n${e.slice(0, 5)}`).replace(/,/g, '')}`).setColor("#FFBF40").setTimestamp()))

        return page.start(interaction, buttons)
      }

      if (interaction.customId === "reroll") {
        if (!interaction.member.roles.cache.has(client.config.developerRole)) return interaction.reply({
          ephemeral: true,
          content: "You have to be a developer to reroll giveaways!"
        }).catch(() => { })

        if (!giveaway.ended) return interaction.reply({
          ephemeral: true,
          content: "You can't reroll a giveaway that hasn't ended yet!"
        }).catch(() => { })

        if (giveaway.users.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You can't reroll a giveaway with no participants!"
        }).catch(() => { })

        if (giveaway.picking.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You rerolled enough times that I couldn't pick a winner due to no more possible winners in the database. You'll have to manually pick one now. "
        }).catch(() => { })

        if (giveaway.winners >= 2) {
          const embed = new EmbedBuilder()
            .setColor("#FFBF40")
            .setDescription(`${giveaway.pickedWinners.map((w, i) =>
              `**${i++ + 1}.** <@${w.id}> (\`${w.id}\`)`).join("\n")}`);

          let buttons;
          if (giveaway.winners === 2) {
            buttons = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('reroll-first')
                  .setLabel('First')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-second')
                  .setLabel('Second')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-all')
                  .setLabel('All')
                  .setStyle('Danger'),
              );

            return interaction.reply({ ephemeral: true, embeds: [embed], components: [buttons] }).catch(() => { })
          }
          else if (giveaway.winners === 3) {
            buttons = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('reroll-first')
                  .setLabel('First')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-second')
                  .setLabel('Second')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-third')
                  .setLabel('Third')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-all')
                  .setLabel('All')
                  .setStyle('Danger'),
              );

            return interaction.reply({ ephemeral: true, embeds: [embed], components: [buttons] }).catch(() => { })
          }
          else if (giveaway.winners === 4) {
            buttons = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('reroll-first')
                  .setLabel('First')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-second')
                  .setLabel('Second')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-third')
                  .setLabel('Third')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-fourth')
                  .setLabel('Fourth')
                  .setStyle('Secondary'),
              );


            const buttons2 = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('reroll-all')
                  .setLabel('All')
                  .setStyle('Danger'),
              )

            return interaction.reply({ ephemeral: true, embeds: [embed], components: [buttons, buttons2] }).catch(() => { })
          }
          else if (giveaway.winners === 5) {
            buttons = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('reroll-first')
                  .setLabel('First')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-second')
                  .setLabel('Second')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-third')
                  .setLabel('Third')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-fourth')
                  .setLabel('Fourth')
                  .setStyle('Secondary'),
                new ButtonBuilder()
                  .setCustomId('reroll-fifth')
                  .setLabel('Fifth')
                  .setStyle('Secondary'),
              );

            const buttons2 = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('reroll-all')
                  .setLabel('All')
                  .setStyle('Danger'),
              )

            return interaction.reply({ ephemeral: true, embeds: [embed], components: [buttons, buttons2] }).catch(() => { })
          }
        }

        giveaway.pickedWinners = [];

        for (let i = 0; i < giveaway.winners; i++) {
          let winner = giveaway.picking[Math.floor(Math.random() * giveaway.picking.length)];

          const filtered = giveaway.picking.filter(object => object.userID != winner.user.id)
          giveaway.picking = filtered;

          giveaway.pickedWinners.push({
            id: winner.user.id,
            user: winner.user
          })

          await giveaway.save();
        }

        const successEmbed = new EmbedBuilder()
          .setColor("#FFBF40")
          .setAuthor({
            name: `Giveaway`,
            iconURL: interaction.guild.iconURL()
          })
          .setDescription(`\`${interaction.member.user.tag}\` rerolled the giveaway.`)
          .addFields([{ name: "Ended", value: `<t:${Math.floor((giveaway.endDate) / 1000)}:R>`, inline: true },
          { name: "Prize", value: `${giveaway.prize}`, inline: true },
          { name: "Winner(s)", value: `${giveaway.pickedWinners.map(w => `<@${w.user.id}> (\`${w.user.id}\`)`).join(", ")}` }])

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").send(`${giveaway.pickedWinners.map(w => `<@${w.user.id}>`).join(", ")}`).then(m => setTimeout(async () => {
          m.delete()
        }, 2500)).catch(() => {
          return;
        })
        return interaction.update({
          embeds: [successEmbed]
        })
      }

      if (interaction.customId === "reroll-all") {
        const giveaways = await Giveaways.findOne({
          msgId: interaction.message.reference.messageId
        });

        if (giveaways.users.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You can't reroll a giveaway with no participants!"
        }).catch(() => { })

        if (giveaways.picking.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You rerolled enough times that I couldn't pick a winner due to no more possible winners in the database. You'll have to manually pick one now. "
        }).catch(() => { })

        if (giveaways.winners > giveaways.picking.length) return interaction.reply({
          ephemeral: true,
          content: `There's not enough people in the giveaway to reroll all winners, there's only **${giveaways.picking.length}** possible winner(s) allowed. You'll have to select only certain people to be rerolled. `
        }).catch(() => { })

        giveaways.pickedWinners = [];

        for (let i = 0; i < giveaways.winners; i++) {
          let winner = giveaways.picking[Math.floor(Math.random() * giveaways.picking.length)];

          const filtered = giveaways.picking.filter(object => object.userID != winner.user.id)
          giveaways.picking = filtered;

          giveaways.pickedWinners.push({
            id: winner.user.id,
            user: winner.user
          })

          await giveaways.save();
        }

        const successEmbed = new EmbedBuilder()
          .setColor("#FFBF40")
          .setAuthor({
            name: `Giveaway`,
            iconURL: interaction.guild.iconURL()
          })
          .setDescription(`\`${interaction.member.user.tag}\` rerolled the giveaway.`)
          .addFields([{ name: "Ended", value: `<t:${Math.floor((giveaways.endDate) / 1000)}:R>`, inline: true },
          { name: "Prize", value: `${giveaways.prize}`, inline: true },
          { name: "Winner(s)", value: `${giveaways.pickedWinners.map(w => `<@${w.user.id}> (\`${w.user.id}\`)`).join(", ")}` }])

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").send(`${giveaways.pickedWinners.map(w => `<@${w.user.id}>`).join(", ")}`).then(m => setTimeout(async () => {
          m.delete()
        }, 2500)).catch(() => {
          return;
        })

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").messages.fetch({ message: giveaways.msgId }).then(m => m.edit({
          embeds: [successEmbed],
        }));

        return interaction.reply({ ephemeral: true, content: "Successfully rerolled all users!" }).catch(() => { })
      }

      if (interaction.customId === "reroll-first") {
        const giveaways = await Giveaways.findOne({
          msgId: interaction.message.reference.messageId
        });

        if (giveaways.users.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You can't reroll a giveaway with no participants!"
        }).catch(() => { })

        if (giveaways.picking.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You rerolled enough times that I couldn't pick a winner due to no more possible winners in the database. You'll have to manually pick one now. "
        }).catch(() => { })

        let winner = giveaways.picking[Math.floor(Math.random() * giveaways.picking.length)];

        const filtered = giveaways.picking.filter(object => object.userID != winner.user.id)
        giveaways.picking = filtered;

        const filtered2 = giveaways.pickedWinners.filter(object => object.id != giveaways.pickedWinners[0].id)
        giveaways.pickedWinners = filtered2;

        giveaways.pickedWinners.push({
          id: winner.user.id,
          user: winner.user
        })

        await giveaways.save();

        const successEmbed = new EmbedBuilder()
          .setColor("#FFBF40")
          .setAuthor({
            name: `Giveaway`,
            iconURL: interaction.guild.iconURL()
          })
          .setDescription(`\`${interaction.member.user.tag}\` rerolled the giveaway.`)
          .addFields([{ name: "Ended", value: `<t:${Math.floor((giveaways.endDate) / 1000)}:R>`, inline: true },
          { name: "Prize", value: `${giveaways.prize}`, inline: true },
          { name: "Winner(s)", value: `${giveaways.pickedWinners.map(w => `<@${w.user.id}> (\`${w.user.id}\`)`).join(", ")}` }])

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").send(`<@${winner.user.id}>`).then(m => setTimeout(async () => {
          m.delete()
        }, 2500)).catch(() => {
          return;
        })

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").messages.fetch({ message: giveaways.msgId }).then(m => m.edit({
          embeds: [successEmbed],
        }));

        return interaction.reply({ ephemeral: true, content: "Successfully rerolled the first user!" }).catch(() => { })
      }

      if (interaction.customId === "reroll-second") {
        const giveaways = await Giveaways.findOne({
          msgId: interaction.message.reference.messageId
        });

        if (giveaways.users.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You can't reroll a giveaway with no participants!"
        }).catch(() => { })

        if (giveaways.picking.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You rerolled enough times that I couldn't pick a winner due to no more possible winners in the database. You'll have to manually pick one now. "
        }).catch(() => { })

        let winner = giveaways.picking[Math.floor(Math.random() * giveaways.picking.length)];

        const filtered = giveaways.picking.filter(object => object.userID != winner.user.id)
        giveaways.picking = filtered;

        const filtered2 = giveaways.pickedWinners.filter(object => object.id != giveaways.pickedWinners[1].id)
        giveaways.pickedWinners = filtered2;

        giveaways.pickedWinners.push({
          id: winner.user.id,
          user: winner.user
        })

        await giveaways.save();

        const successEmbed = new EmbedBuilder()
          .setColor("#FFBF40")
          .setAuthor({
            name: `Giveaway`,
            iconURL: interaction.guild.iconURL()
          })
          .setDescription(`\`${interaction.member.user.tag}\` rerolled the giveaway.`)
          .addFields([{ name: "Ended", value: `<t:${Math.floor((giveaways.endDate) / 1000)}:R>`, inline: true },
          { name: "Prize", value: `${giveaways.prize}`, inline: true },
          { name: "Winner(s)", value: `${giveaways.pickedWinners.map(w => `<@${w.user.id}> (\`${w.user.id}\`)`).join(", ")}` }])

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").send(`<@${winner.user.id}>`).then(m => setTimeout(async () => {
          m.delete()
        }, 2500)).catch(() => {
          return;
        })

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").messages.fetch({ message: giveaways.msgId }).then(m => m.edit({
          embeds: [successEmbed],
        }));

        return interaction.reply({ ephemeral: true, content: "Successfully rerolled the first user!" }).catch(() => { })
      }

      if (interaction.customId === "reroll-third") {
        const giveaways = await Giveaways.findOne({
          msgId: interaction.message.reference.messageId
        });

        if (giveaways.users.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You can't reroll a giveaway with no participants!"
        }).catch(() => { })

        if (giveaways.picking.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You rerolled enough times that I couldn't pick a winner due to no more possible winners in the database. You'll have to manually pick one now. "
        }).catch(() => { })

        let winner = giveaways.picking[Math.floor(Math.random() * giveaways.picking.length)];

        const filtered = giveaways.picking.filter(object => object.userID != winner.user.id)
        giveaways.picking = filtered;

        const filtered2 = giveaways.pickedWinners.filter(object => object.id != giveaways.pickedWinners[2].id)
        giveaways.pickedWinners = filtered2;

        giveaways.pickedWinners.push({
          id: winner.user.id,
          user: winner.user
        })

        await giveaways.save();

        const successEmbed = new EmbedBuilder()
          .setColor("#FFBF40")
          .setAuthor({
            name: `Giveaway`,
            iconURL: interaction.guild.iconURL()
          })
          .setDescription(`\`${interaction.member.user.tag}\` rerolled the giveaway.`)
          .addFields([{ name: "Ended", value: `<t:${Math.floor((giveaways.endDate) / 1000)}:R>`, inline: true },
          { name: "Prize", value: `${giveaways.prize}`, inline: true },
          { name: "Winner(s)", value: `${giveaways.pickedWinners.map(w => `<@${w.user.id}> (\`${w.user.id}\`)`).join(", ")}` }])

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").send(`<@${winner.user.id}>`).then(m => setTimeout(async () => {
          m.delete()
        }, 2500)).catch(() => {
          return;
        })

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").messages.fetch({ message: giveaways.msgId }).then(m => m.edit({
          embeds: [successEmbed],
        }));

        return interaction.reply({ ephemeral: true, content: "Successfully rerolled the third user!" }).catch(() => { })
      }

      if (interaction.customId === "reroll-fourth") {
        const giveaways = await Giveaways.findOne({
          msgId: interaction.message.reference.messageId
        });

        if (giveaways.users.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You can't reroll a giveaway with no participants!"
        }).catch(() => { })

        if (giveaways.picking.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You rerolled enough times that I couldn't pick a winner due to no more possible winners in the database. You'll have to manually pick one now. "
        }).catch(() => { })

        let winner = giveaways.picking[Math.floor(Math.random() * giveaways.picking.length)];

        const filtered = giveaways.picking.filter(object => object.userID != winner.user.id)
        giveaways.picking = filtered;

        const filtered2 = giveaways.pickedWinners.filter(object => object.id != giveaways.pickedWinners[3].id)
        giveaways.pickedWinners = filtered2;

        giveaways.pickedWinners.push({
          id: winner.user.id,
          user: winner.user
        })

        await giveaways.save();

        const successEmbed = new EmbedBuilder()
          .setColor("#FFBF40")
          .setAuthor({
            name: `Giveaway`,
            iconURL: interaction.guild.iconURL()
          })
          .setDescription(`\`${interaction.member.user.tag}\` rerolled the giveaway.`)
          .addFields([{ name: "Ended", value: `<t:${Math.floor((giveaways.endDate) / 1000)}:R>`, inline: true },
          { name: "Prize", value: `${giveaways.prize}`, inline: true },
          { name: "Winner(s)", value: `${giveaways.pickedWinners.map(w => `<@${w.user.id}> (\`${w.user.id}\`)`).join(", ")}` }])

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").send(`<@${winner.user.id}>`).then(m => setTimeout(async () => {
          m.delete()
        }, 2500)).catch(() => {
          return;
        })

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").messages.fetch({ message: giveaways.msgId }).then(m => m.edit({
          embeds: [successEmbed],
        }));

        return interaction.reply({ ephemeral: true, content: "Successfully rerolled the fourth user!" }).catch(() => { })
      }

      if (interaction.customId === "reroll-fifth") {
        const giveaways = await Giveaways.findOne({
          msgId: interaction.message.reference.messageId
        });

        if (giveaways.users.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You can't reroll a giveaway with no participants!"
        }).catch(() => { })

        if (giveaways.picking.length === 0) return interaction.reply({
          ephemeral: true,
          content: "You rerolled enough times that I couldn't pick a winner due to no more possible winners in the database. You'll have to manually pick one now. "
        }).catch(() => { })

        let winner = giveaways.picking[Math.floor(Math.random() * giveaways.picking.length)];

        const filtered = giveaways.picking.filter(object => object.userID != winner.user.id)
        giveaways.picking = filtered;

        const filtered2 = giveaways.pickedWinners.filter(object => object.id != giveaways.pickedWinners[4].id)
        giveaways.pickedWinners = filtered2;

        giveaways.pickedWinners.push({
          id: winner.user.id,
          user: winner.user
        })

        await giveaways.save();

        const successEmbed = new EmbedBuilder()
          .setColor("#FFBF40")
          .setAuthor({
            name: `Giveaway`,
            iconURL: interaction.guild.iconURL()
          })
          .setDescription(`\`${interaction.member.user.tag}\` rerolled the giveaway.`)
          .addFields([{ name: "Ended", value: `<t:${Math.floor((giveaways.endDate) / 1000)}:R>`, inline: true },
          { name: "Prize", value: `${giveaways.prize}`, inline: true },
          { name: "Winner(s)", value: `${giveaways.pickedWinners.map(w => `<@${w.user.id}> (\`${w.user.id}\`)`).join(", ")}` }])

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").send(`<@${winner.user.id}>`).then(m => setTimeout(async () => {
          m.delete()
        }, 2500)).catch(() => {
          return;
        })

        client.guilds.cache.get("286252263109033984").channels.cache.get("622617791538921492").messages.fetch({ message: giveaways.msgId }).then(m => m.edit({
          embeds: [successEmbed],
        }));

        return interaction.reply({ ephemeral: true, content: "Successfully rerolled the fifth user!" }).catch(() => { })
      }

      if (interaction.customId === "end") {
        if (!interaction.member.roles.cache.has(client.config.developerRole)) return interaction.reply({
          ephemeral: true,
          content: "You have to be a developer to end giveaways!"
        }).catch(() => { })

        if (giveaway.ended) return interaction.reply({
          ephemeral: true,
          content: "You can't end a giveaway that has ended already!"
        }).catch(() => { })

        const successEmbed = new EmbedBuilder()
          .setColor("#FFBF40")
          .setAuthor({
            name: `Giveaway`,
            iconURL: interaction.guild.iconURL()
          })
          .setDescription(`\`${interaction.member.user.tag}\` ended the giveaway.`)
          .addFields([{ name: "Ended", value: `<t:${Math.floor((Date.now()) / 1000)}:R>`, inline: true },
          { name: "Prize", value: `${giveaway.prize}`, inline: true },
          { name: "Winner(s)", value: `none` }])

        interaction.update({
          embeds: [successEmbed],
          components: []
        });

        return await giveaway.delete();
      }

      if (interaction.customId === "claim") {
        if (!interaction.member.roles.cache.has(client.config.developerRole)) return interaction.reply({
          ephemeral: true,
          content: "You have to be a developer to claim giveaways!"
        }).catch(() => { })

        const successEmbed = new EmbedBuilder()
          .setColor("#FFBF40")
          .setAuthor({
            name: `Giveaway`,
            iconURL: interaction.guild.iconURL()
          })
          .setDescription(`The winners claimed their prize!`)
          .addFields([{ name: "Ended", value: `<t:${Math.floor((giveaway.endDate) / 1000)}:R>`, inline: true },
          { name: "Prize", value: `${giveaway.prize}`, inline: true },
          { name: "Winner(s)", value: `${giveaway.pickedWinners.map(w => `<@${w.user.id}> (\`${w.user.id}\`)`).join(", ")}` }])

        interaction.update({
          embeds: [successEmbed],
          components: []
        });

        return await giveaway.delete();
      }

      switch (interaction.customId) {
        case "first":
          if (page === 0) {
            return interaction.reply({
              ephemeral: true,
              content: "You can't proceed that way any further."
            }).catch(() => { })
          } else {
            interaction.update({
              ephemeral: true,
              embeds: [pages[0].setFooter({
                text: `Page 1 / ${pages.length}`
              })]
            }).catch(() => { })
            return page = 0;
          }
        case "prev":
          if (pages[page - 1]) {
            return interaction.update({
              ephemeral: true,
              embeds: [pages[--page].setFooter({
                text: `Page ${[page + 1]} / ${pages.length}`
              })]
            }).catch(() => { })
          } else {
            return interaction.reply({
              ephemeral: true,
              content: "You can't proceed that way any further."
            }).catch(() => { })
          }
        case "next":
          if (pages[page + 1]) {
            return interaction.update({
              ephemeral: true,
              embeds: [pages[++page].setFooter({
                text: `Page ${[page + 1]} / ${pages.length}`
              })]
            }).catch(() => { })
          } else {
            return interaction.reply({
              ephemeral: true,
              content: "You can't proceed that way any further."
            }).catch(() => { })
          }
        case "last":
          if (page === pages.length - 1) {
            return interaction.reply({
              ephemeral: true,
              content: "You can't proceed that way any further."
            }).catch(() => { })
          } else {
            interaction.update({
              ephemeral: true,
              embeds: [pages[pages.length - 1].setFooter({
                text: `Page ${pages.length} / ${pages.length}`
              })]
            }).catch(() => { })
            return page = pages.length - 1;
          }
      }
    }

    const type = misc.find((s) => s.name === interaction.customId)
    if (type) {
      if (interaction.member.roles.cache.has(type.id)) {
        interaction.member.roles.remove(type.id);
        interaction.reply({
          content: `Successfully removed the **${type.name}** role.`,
          ephemeral: true
        }).catch(() => { })
      } else {
        interaction.member.roles.add(type.id);
        interaction.reply({
          content: `Successfully gave you the **${type.name}** role.`,
          ephemeral: true
        }).catch(() => { })
      }

      client.buttons.set(interaction.member.id, Date.now() + 3000)
      setTimeout(() => client.buttons.delete(interaction.member.id), 3000)
      return
    }
  }
};
