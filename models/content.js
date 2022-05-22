const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const contentSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  author: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    required: true,
  },
  absract: {
    type: String,
    required: true,
  },
  contentUrl: {
    type: String,
    required: true,
  },
  publishDate: {
    type: String,
    required: true,
  },
});
