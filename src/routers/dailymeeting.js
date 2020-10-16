const express = require("express");
const moment = require("moment");
const router = new express.Router();
const Sprint = require("../models/sprint");
const Story = require("../models/story");
const Player = require("../models/player");
const DailyMeeting = require("../models/dailymeeting");

router.get("/sprints/:id/dailymeetings", async (req, res) => {
  const _id = req.params.id;

  try {
    const dailymeetings = await DailyMeeting.find({ sprint: _id });

    if (!dailymeetings) {
      return res.status(404).send();
    }

    res.send(dailymeetings);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/sprints/:id/daily/finish", async (req, res) => {
  const _id = req.params.id;
  let totalHours = 0;

  try {
    const stories = await Story.find({ sprint: { _id } }).populate("tasks");

    if (!stories) {
      return res.status(404).send();
    }

    // Calculate the total hours of tasks that are DONE
    let hoursDone = 0;
    for (const story of stories) {
      for (const task of story.tasks) {
        if (task.status === "DONE") {
          hoursDone += task.hours;
        }
        totalHours += task.hours;
      }
    }

    // Get all the daily meetings that are not finished yet
    const dailymeetings = await DailyMeeting.find({
      sprint: _id,
      finished: false,
    });

    if (dailymeetings.length > 0) {
      let first = true;
      let current = null;

      for (daily of dailymeetings) {
        // Update the executed value for all not finished daily meetings
        daily.executed = hoursDone;
        // It its the first daily found (current)
        if (first) {
          daily.finished = true;
          current = daily;
        }
        first = false;
        await daily.save();
      }

      const sprint = await Sprint.findOne({ _id });
      // If it was the last daily meeting, the sprint is over
      if (dailymeetings.length === 1) {
        sprint.status = "Finalizada";
      } else {
        sprint.status = "Em andamento";
      }
      await sprint.save();

      res.send({
        planned: (current.planned / totalHours) * 100,
        executed: (current.executed / totalHours) * 100,
      });
    }
    res.send({
      planned: 0,
      executed: 0,
    });
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

router.get("/sprints/dailymeetings/:id", async (req, res) => {
  const _id = req.params.id;

  try {
    const dailymeeting = await DailyMeeting.find({ _id });

    if (!dailymeeting) {
      return res.status(404).send();
    }

    res.send(dailymeeting);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

// router.put('/players/:id', async (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['startDate', 'endDate']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
//
//     if (!isValidOperation) {
//          return res.status(400).send({ error: 'Invalid updates!' })
//     }
//
//     try {
//
//         const player = await Player.findOne({ _id: req.params.id})
//
//         if (!player) {
//              return res.status(404).send()
//         }
//         updates.forEach((update) => player[update] = req.body[update])
//
//         await player.save()
//
//         const playerSaved = await Player.findOne({ _id: req.params.id}).populate("project").populate("user");
//
//         res.send(playerSaved)
//     } catch (e) {
//         console.log(e);
//         res.status(400).send(e)
//     }
// })

// Remove a daily meeting
// Update the total hours of the sprint
// Update the daily meetings orders
router.delete("/dailymeetings/:id", async (req, res) => {
  try {
    const _id = req.params.id;
    // Get the daily meeting to be deleted
    const dailymeeting = await DailyMeeting.findById(_id);
    let order = parseInt(dailymeeting.order);

    if (!dailymeeting) {
      // Not found
    }

    // Get the sprint owner
    const sprint = await Sprint.findById(dailymeeting.sprint).populate("team");

    let hours = 0;
    // Get the sprint team and
    // Check how many are dev or business analyst
    for (const user of sprint.team) {
      console.log("user", user);
      if (
        user.role.toString() === "Desenvolvedor" ||
        user.role.toString() === "Analista de Negócio"
      ) {
        // 1 work day less for each dev or business analyst
        hours += 8;
      }
    }
    sprint.totalHours -= hours;

    // Remove the daily meeting
    await DailyMeeting.findOneAndDelete({ _id });
    // Save the sprint with the totalhours updated
    await sprint.save();

    // Update the daily meetings orders
    const dailymeetings = await DailyMeeting.find({ sprint: sprint._id });
    for (const daily of dailymeetings) {
      console.log(daily.order);
      if (parseInt(daily.order) > order) {
        daily.order = order;
        await daily.save();
        order++;
      }
    }

    const updatedDailyMeetings = await DailyMeeting.find({
      sprint: sprint._id,
    });
    if (!updatedDailyMeetings) {
      return res.status(404).send();
    }

    res.send(updatedDailyMeetings);

    // // Return the updated sprint
    // const savedSprint = await Sprint.findById(sprint._id)
    //   .populate("project")
    //   .populate("team");

    // if (!savedSprint) {
    //   return res.status(404).send();
    // }

    // res.send(savedSprint);
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
});

// router.post('/sprints/:id/dailymeetings', async (req, res) => {
//
//     const _id = req.params.id
//     // Get the sprint start and end datess
//     const sprint = await Sprint.findOne({_id});
//     let _date = sprint.startDate;
//
//     // From start to end date, create one daily meeting for each business day
//     while (moment(_date).isSameOrBefore(sprint.endDate, "day")) {
//       // If it's not saturday or sunday
//       if (moment(_date).day() !== 0 && moment(_date).day() !== 6) {
//         // Create a daily meeting
//         let daily = new Daily({day: moment(_date).valueOf(), sprint: _id});
//         await daily.save()
//       }
//       // Go to next day
//       _date = moment(_date).add(1, 'days')
//     }
//
//     console.log("BODY", req.body)
//     res.send()
//     //const daily = new Player(req.body)
//
//     // try {
//     //     await player.save()
//     //     const savedPlayer = await Player.findOne({_id: player._id }).populate("project").populate("user");
//     //
//     //     res.status(201).send(savedPlayer)
//     // } catch (e) {
//     //     console.log(e);
//     //     res.status(400).send(e)
//     // }
// })
//

module.exports = router;
