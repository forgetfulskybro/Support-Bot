const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  block: { type: String },
});

module.exports = mongoose.model("blocks", Schema);
