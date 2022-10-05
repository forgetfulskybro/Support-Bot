const { Octokit } = require("@octokit/core");
module.exports = async (client, messageReaction, user) => {
    try {
        if (messageReaction.message.partial) await messageReaction.message.fetch();
        if (messageReaction.partial) await messageReaction.fetch();
    } catch { }
    if (user.bot) return;

    const forgetful = client.config.owner;
    const mezo = client.config.admins[0];
    const both = [process.env.GITHUB_TOKEN_1, process.env.GITHUB_TOKEN_2]

    if (messageReaction._emoji.id === `${client.config.emojis.greenTick.replace("<:GoodCheck:", "").replace(">", "")}` && messageReaction.message.channelId === client.config.suggests) {
        if (user.id === forgetful) {
            await messageReaction.message.reactions.removeAll();

            const octokit = new Octokit({
                auth: process.env.GITHUB_TOKEN_1
            })

            return await octokit.request('POST /repos/Would-You-Bot/Would-You/issues', {
                owner: 'Would-You-Bot',
                repo: 'Would-You',
                title: `${messageReaction.message.author.username}'s Request`,
                body: messageReaction.message.content,
                labels: ["Discord Request", "enhancement"]
            })
        } else if (user.id === mezo) {
            messageReaction.message.reactions.removeAll();

            const octokit = new Octokit({
                auth: process.env.GITHUB_TOKEN_2
            })

            return await octokit.request('POST /repos/Would-You-Bot/Would-You/issues', {
                owner: 'Would-You-Bot',
                repo: 'Would-You',
                title: `${messageReaction.message.author.username}'s Request`,
                body: messageReaction.message.content,
                labels: ["Discord Request", "enhancement"]
            })
        } else if (messageReaction.count === 6 && messageReaction.me) {
            messageReaction.message.reactions.removeAll();
            const auth = both[Math.floor(Math.random() * both.length)]
            const octokit = new Octokit({
                auth: auth
            })

            return await octokit.request('POST /repos/Would-You-Bot/Would-You/issues', {
                owner: 'Would-You-Bot',
                repo: 'Would-You',
                title: `${messageReaction.message.author.username}'s Request`,
                body: messageReaction.message.content,
                labels: ["Discord Request", "enhancement"]
            })
        }
    } else if (messageReaction._emoji.id === `${client.config.emojis.redTick.replace("<:BadCheck:", "").replace(">", "")}` && messageReaction.message.channelId === client.config.suggests) {
        if (messageReaction.count === 6 && messageReaction.me) {
            messageReaction.message.reactions.removeAll();
        }
    }
};
