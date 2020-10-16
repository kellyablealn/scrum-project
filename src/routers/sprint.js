const express = require("express");
const moment = require("moment");
const router = new express.Router();
const Sprint = require("../models/sprint");
const Player = require("../models/player");
const Story = require("../models/story");
const DailyMeeting = require("../models/dailymeeting");

router.get("/sprints", async (req, res) => {
  try {
    const sprints = await Sprint.find().populate("project");

    if (!sprints) {
      return res.status(404).send();
    }

    res.send(sprints);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/sprints/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const sprint = await Sprint.findOne({ _id })
      .populate("project")
      .populate("team");

    if (!sprint) {
      return res.status(404).send();
    }

    res.send(sprint);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/sprints/project/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const sprints = await Sprint.find({ project: { _id } }).populate("project");

    if (!sprints) {
      return res.status(404).send();
    }

    res.send(sprints);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.put("/sprints/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["goal", "totalHours", "dailyLink"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const sprint = await Sprint.findOne({ _id: req.params.id });

    if (!sprint) {
      return res.status(404).send();
    }
    updates.forEach((update) => (sprint[update] = req.body[update]));
    await sprint.save();
    res.send(sprint);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.get("/sprints/:id/prepare", async (req, res) => {
  try {
    const _id = req.params.id;

    // Get the sprint by _id
    const sprint = await Sprint.findOne({ _id });
    if (!sprint) {
      return res.status(404).send();
    }

    // Get the total hours of all stories' tasks
    const stories = await Story.find({ sprint: req.params.id });
    total = 0;
    stories.forEach((story, i) => {
      total += story.totalHours;
    });

    // Set sprint to the next status
    sprint.status = "Não iniciada";
    // Set the total hour of work
    sprint.workHours = total;
    await sprint.save();

    // Calculate the necessary amount of work hours per day (planned)
    const dailymeetings = await DailyMeeting.find({ sprint: req.params.id });
    const days = dailymeetings.length - 1;
    const hoursPerDay = total / days;

    // Set the planned hours of work per day for every daily meeting (planned work)
    // First day: 0 (when the sprint starts)
    // Last day should be total
    let hours = 0;
    for (const daily of dailymeetings) {
      daily.planned = hours;
      hours += hoursPerDay;
      await daily.save();
    }

    const savedSprint = await Sprint.findOne({ _id })
      .populate("project")
      .populate("team");
    // Return the Sprint updated
    res.send(savedSprint);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

// Remove Team Player from the sprint
//router.patch("/sprints/:id", async (req, res) => {
router.patch("/sprints/:id/remove/team-player/:userId", async (req, res) => {
  try {
    const sprintId = req.params.id;
    const userId = req.params.userId;

    // Get the sprint information
    const sprint = await Sprint.findOne({ _id: sprintId });
    if (!sprint) {
      return res.status(404).send();
    }

    // Get the team player
    const teamPlayer = await Player.findOne({
      user: userId,
    }).populate("user");
    if (!teamPlayer) {
      return res.status(404).send();
    }

    // Check if it is dev or business analyst
    if (
      teamPlayer.user.role.toString() === "Desenvolvedor" ||
      teamPlayer.user.role.toString() === "Analista de Negócio"
    ) {
      const dailymeetings = await DailyMeeting.find({ sprint: sprintId });
      if (!dailymeetings || dailymeetings.length === 0) {
        return res.status(404).send();
      }

      // Get the total hours of work for this person and substract from total hours available for the Sprint
      const hours = (dailymeetings.length - 1) * 8;
      sprint.totalHours -= hours;
    }

    // Remove the team player from the sprint
    const newTeam = sprint.team.filter((id) => id.toString() !== userId);

    // Save the sprint team and totalhours new data
    sprint.team = newTeam;
    await sprint.save();

    // Get the sprint with the new data
    const savedSprint = await Sprint.findOne({ _id: req.params.id })
      .populate("project")
      .populate("team");

    res.send(savedSprint);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

router.delete("/sprints/:id", async (req, res) => {
  try {
    const _id = req.params.id;

    await Sprint.findOneAndDelete({ _id });

    res.send();
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/sprints/:id/progress", async (req, res) => {
  const _id = req.params.id;

  try {
    // Get sprint and check if it has started
    const sprint = await Sprint.findOne({ _id });
    if (sprint.status === "Não iniciada") {
      // Get the first dailymeeting
      let dailymeeting = await DailyMeeting.findOne({
        sprint: _id,
        finished: false,
        order: 1,
      });
      if (dailymeeting) {
        if (!moment(dailymeeting.day).isSame(Date.now(), "day")) {
          dailymeeting = null;
        }
      }

      // If not started (send either null daily or the first one)
      res.send({
        dailymeeting,
        planned: 0,
        executed: 0,
      });
    } else if (sprint.status === "Em andamento") {
      // Get the next not finished daily meeting
      let dailymeeting = await DailyMeeting.findOne({
        sprint: _id,
        finished: false,
      })
        .sort({ order: 1 })
        .limit(1);

      if (dailymeeting) {
        if (!moment(dailymeeting.day).isSame(Date.now(), "day")) {
          dailymeeting = await DailyMeeting.findOne({
            sprint: _id,
            finished: true,
          })
            .sort({ order: -1 })
            .limit(1);
        }

        const planned = (dailymeeting.planned / sprint.workHours) * 100;
        const executed = (dailymeeting.executed / sprint.workHours) * 100;

        res.send({
          dailymeeting,
          planned: planned,
          executed: executed,
        });
      }
    } else if (sprint.status === "Finalizada") {
      // Get the last finished daily meeting
      const dailymeeting = await DailyMeeting.findOne({
        sprint: _id,
        finished: true,
      })
        .sort({ order: -1 })
        .limit(1);

      const executed = (dailymeeting.executed / sprint.workHours) * 100;
      // executed: last daily meeting executed
      res.send({
        planned: 100,
        executed: executed,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.post("/sprints", async (req, res) => {
  let days = 1;
  let countTeam = 0;
  try {
    // Generate new sprint with the request data
    const sprint = new Sprint(req.body);

    // Get the project team and save as the Sprint team
    // TODO: get only active and between date range
    const players = await Player.find({
      project: { _id: sprint.project },
    }).populate("user");
    players.forEach((player, i) => {
      // Count the team players that will work during the Sprint
      if (
        player.user.role.toString() === "Desenvolvedor" ||
        player.user.role.toString() === "Analista de Negócio"
      ) {
        countTeam++;
      }
      sprint.team.push(player.user._id);
    });

    // Get the sprint start and end dates
    let _date = sprint.startDate;

    // From start to end date, create one daily meeting for each business day
    while (moment(_date).isSameOrBefore(sprint.endDate, "day")) {
      // If it's not saturday or sunday
      if (moment(_date).day() !== 0 && moment(_date).day() !== 6) {
        // Create a daily meeting
        let daily = new DailyMeeting({
          day: moment(_date).valueOf(),
          sprint: sprint._id,
          planned: 0,
          executed: 0,
          finished: false,
          order: days,
        });
        // Save the daily meeting
        await daily.save();
        days++;
      }
      // Go to next day
      _date = moment(_date).add(1, "days");
    }

    // Calculate the totalhours for the Sprint
    const hours = (days - 2) * 8 * countTeam;
    sprint.totalHours = hours;
    // Sprint status
    sprint.status = "Nova";
    console.log(sprint);
    // Save the new sprint
    await sprint.save();

    // Return the new sprint
    res.status(201).send(sprint);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

module.exports = router;
