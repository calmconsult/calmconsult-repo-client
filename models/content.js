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
  dateAdded: { type: Date, default: Date.now },
  accessRestriction: {
    type: String,
    enum: ["private", "public"],
    default: "public",
  },
  collections: [],
});

contentSchema.index({
  title: "text",
  authors: ["text"],
  abstract: "text",
  subject: "text",
  // collections: ["text"],
});

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
