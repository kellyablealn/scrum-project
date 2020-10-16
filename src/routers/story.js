const express = require("express");
const router = new express.Router();
const Story = require("../models/story");
const Backlog = require("../models/backlog");
const COLORS = require("../utils/colors");

router.get("/stories/sprint/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const stories = await Story.find({ sprint: { _id } })
      .populate("sprint")
      .populate("backlog")
      .populate("tasks");

    if (!stories) {
      return res.status(404).send();
    }

    res.send(stories);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/stories/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const story = await Story.findOne({ _id })
      .populate("sprint")
      .populate("backlog")
      .populate("tasks");

    if (!story) {
      return res.status(404).send();
    }

    res.send(story);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

// Delete a sprint story and update the backlog item to clear the sprint
router.delete("/stories/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    const story = await Story.findById(_id);
    if (!story) {
      return res.status(404).send();
    }

    // Update the backlogItem
    const backlogItem = await Backlog.findById(story.backlog);
    console.log("backlog item", backlogItem);
    if (!backlogItem) {
      return res.status(404).send();
    }

    backlogItem.sprint = undefined;
    await backlogItem.save();

    // Delete the sprint story
    await Story.findOneAndDelete({ _id });

    res.send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

// Create a sprint story and set the sprint for the backlog item
router.post("/stories", async (req, res) => {
  const story = new Story(req.body);
  const i = Math.round(Math.random() * 16);
  try {
    story.color = COLORS[i];
    await story.save();

    // Update the backlogItem
    const backlogItem = await Backlog.findById(story.backlog);
    if (!backlogItem) {
      return res.status(404).send();
    }

    backlogItem.sprint = story.sprint;
    await backlogItem.save();

    const savedStory = await Story.findOne({ _id: story._id })
      .populate("sprint")
      .populate("backlog")
      .populate("tasks");

    res.status(201).send(savedStory);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
