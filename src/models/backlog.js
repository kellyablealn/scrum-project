const mongoose = require("mongoose");

const backlogSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: true,
    },
    priority: {
      type: Number,
      required: true,
    },
    effort: {
      type: Number,
    },
    active: {
      type: Boolean,
    },
    prototypeLink: {
      type: String,
    },
    done: {
      type: Boolean,
    },
    sprint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sprint",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Project",
    },
  },
  {
    timestamps: true,
  }
);

const Backlog = mongoose.model("Backlog", backlogSchema);

module.exports = Backlog;
