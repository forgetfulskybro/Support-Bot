const { Collection } = require('discord.js');
require('dotenv').config();

module.exports = (client) => {
    client.config = require("../config.js")
    client.commands = new Collection();
    client.used = new Map();
    client.buttons = new Map();
    client.login(process.env.TOKEN);
};
