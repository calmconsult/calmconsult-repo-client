const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const contentSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  authors: [],
  abstract: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  contentUrl: {
    type: String,
    required: true,
  },
  contentKey: {
    type: String,
    required: true,
  },
  publishDate: {
    type: String,
    required: true,
  },
  accessRestriction: {
    type: String,
    enum: ["private", "public"],
    default: "public",
  },
  collections: [],
});

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
