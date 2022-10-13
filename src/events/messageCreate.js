const Threading = require("../util/modules/threading.js");
const Bumping = require("../util/modules/bumping.js");
module.exports = async (client, message) => {
    Threading.message(client, message);
    Bumping.message(client, message);
};
