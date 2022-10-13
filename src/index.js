const { Client, GatewayIntentBits, Partials } = require('discord.js');

/* Initialize client */
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers,
    ],
    allowedMentions: {
        parse: ['users'],
        repliedUser: false
    },
    partials: [Partials.Channel, Partials.Message, Partials.Reaction],
    restTimeOffset: 60,
});

const WouldYouSupport = async () => {
    await require('./util/supportClient')(client);
    await require('./util/dbHandler');
    await require('./util/eventLoader')(client);
};

WouldYouSupport();