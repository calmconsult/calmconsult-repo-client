const mongoose = require("mongoose");

const cartegorySchema = new mongoose.Schema({
  collections: {},
  authors: {},
});

module.exports = mongoose.model("Cartegory", cartegorySchema);
