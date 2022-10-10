const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
    msgId: { type: String, required: true },
    users: [{ type: Object }],
    time: { type: String, required: true },
    now: { type: String, required: true },
    prize: { type: String, required: true },
    winners: { type: Number, required: true },
    pickedWinners: [{ type: Object }],
    picking: [{ type: Object }],
    ended: { type: Boolean, default: false },
    requirement: { type: String, required: true },
    endDate: { type: String }
});

module.exports = mongoose.model("giveaway", Schema);
