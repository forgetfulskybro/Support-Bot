const { SlashCommandBuilder, ChannelType } = require("discord.js");
const axios = require("axios");
require("dotenv").config();

module.exports = {
  category: "General",
  data: new SlashCommandBuilder()
    .setName("activity")
    .setDescription("Starts an activity for the server")
    .addChannelOption((option) =>
      option
        .addChannelTypes(ChannelType.GuildVoice)
        .setName("activity-channel")
        .setDescription("The channel to send the activity")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("activity-type")
        .setDescription("Activity type to play")
        .setRequired(true)
        .addChoices(
          { name: "Poker Night", value: "755827207812677713" },
          { name: "YouTube Together", value: "880218394199220334" },
          { name: "Betrayal.io", value: "773336526917861400" },
          { name: "Fishington.io", value: "814288819477020702" },
          { name: "Chess In The Park", value: "832012774040141894" },
          { name: "Letter League", value: "879863686565621790" },
          { name: "Word Snacks", value: "879863976006127627" },
          { name: "SpellCast", value: "852509694341283871" },
          { name: "Checkers In The Park", value: "832013003968348200" },
          { name: "Sketch Heads", value: "902271654783242291" },
          { name: "Blazing 8s", value: "832025144389533716" },
          { name: "Land-io", value: "903769130790969345" },
          { name: "Know What I Meme", value: "950505761862189096" },
          { name: "Ask Away", value: "976052223358406656" },
          { name: "Bobble League", value: "947957217959759964" }
        )
    ),

  async execute(interaction, client) {
    let data;

    const activityType = interaction.options.getString("activity-type");

    await axios({
      method: "post",
      url: `https://discord.com/api/v10/channels/${
        interaction.options.getChannel("activity-channel").id
      }/invites`,
      data: JSON.stringify({
        max_age: 0,
        max_uses: 0,
        target_application_id: activityType,
        target_type: 2,
        temporary: false,
        validate: null,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${process.env.TOKEN}`,
      },
    })
      .then((res) => {
        data = res.data;
      })
      .catch((err) => {
        console.log(err);
      });

    await interaction
      .reply(
        `[Started **${data?.target_application?.name}** in **${data?.channel?.name}**](https://discord.com/invite/${data?.code})`
      )
      .catch((err) => {});
  },
};