const express = require('express')
const mongoose = require('mongoose')
const router = new express.Router()
const Task = require('../models/task')
const Story = require('../models/story')
const Sprint = require('../models/sprint')

router.get('/tasks', async (req, res) => {

    try {
        const tasks = await Task.find().populate("story");

        if (!tasks) {
            return res.status(404).send()
        }

        res.send(tasks)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.get('/tasks/story/:id', async (req, res) => {

    const _id = req.params.id

    try {
        const tasks = await Task.find({story:{_id}}).populate("story");

        if (!tasks) {
            return res.status(404).send()
        }

        res.send(tasks)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.get('/sprints/:id/hours', async (req, res) => {

    const _id = req.params.id

    try {
        // Get all the stories in the sprint
        const stories = await Story.find({sprint:{_id}});
        // Put the stories _id in an array
        const stories_ = []
        stories.forEach((story, i) => {
          stories_.push(story._id)
        });

        // Get all the tasks in the stories array
        const tasks = await Task.find({story:{ $in : stories_}});
        if (!tasks) {
            return res.status(404).send()
        }

        // Sum the hours
        let hours = 0
        tasks.forEach((task, i) => {
          hours+= task.hours
        });

        // Send the information
        res.send({total: hours})
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.get('/tasks/:id', async (req, res) => {

    const _id = req.params.id

    try {
        const task = await Task.findOne({_id }).populate("story");

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})
//
// router.get("/sprints/:id/totalHours", (req, res, next) => {
//
//   const sprintId = req.params.id.toString()
//
//
  // Story.aggregate(
  //   [
  //     {
  //       $match: { sprint: mongoose.Types.ObjectId(sprintId) }
  //     },
  //     // {
  //     //   $lookup: {
  //     //       from: "tasks",
  //     //       localField: "tasks",
  //     //       foriegnField: "_id",
  //     //       as: "taskObjs"
  //     //     }
  //     // },
  //     // {
  //     //   $unwind: "$tasks"
  //     // },
  //     // {
  //     //   $group: {
  //     //     _id: null,
  //     //     totalHours: {$sum: "$tasks"}
  //     //   },
  //     // },
  //   ],
  //   (error, result) => {
  //     if (error) {
  //       res.status(500).json({ errors: [error] });
  //     } else {
  //       res.json(result || { total: 0 });
//   //     }
//   //   }
//   // );
// });

// router.delete('/tasks/:id', async (req, res) => {
//     try {
//
//         const _id = req.params.id
//
//         await Task.findOneAndDelete({_id})
//
//         res.send()
//     } catch (e) {
//         res.status(500).send()
//     }
// })

router.post('/tasks', async (req, res) => {
    const task = new Task(req.body)

    try {
        // Save the new task
        await task.save()

        const story = await Story.findOne({_id:task.story})
        // Insert into the story tasks the task id
        story.tasks.push(task._id)
        // Increment the total hours for the story
        story.totalHours += task.hours
        await story.save()

        // Get the saved story with all fields populated
        const savedStory = await Story.findOne({_id:task.story}).populate("sprint").populate("backlog").populate("tasks");
        res.status(201).send(savedStory)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', async (req, res) => {
    // Taskid to delete
    const _id = req.params.id

    // Get the task
    const task = await Task.findOne({_id})

    try {
        // Get the associated story, in order to remove task from tasks array
        const story = await Story.findOne({_id:task.story._id})
        // Remove the task from the array
        story.tasks = story.tasks.filter((task) => task !== _id)
        story.totalHours -= task.hours
        // Save the story without the task
        await story.save()
        // Delete the task
        await Task.findOneAndDelete({_id})

        // Get the saved story, with all the info populated
        const savedStory = await Story.findOne({_id:task.story}).populate("sprint").populate("backlog").populate("tasks");

        res.status(201).send(savedStory)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

// Update the task status
router.patch('/tasks/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['status']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
         return res.status(400).send({ error: 'Invalid updates!' })
    }

  try {

      // Taskid to update
      const _id = req.params.id
      // Get the task
      const task = await Task.findOne({_id})

      if (!task) {
           return res.status(404).send()
      }
      const storyId = task.story

      updates.forEach((update) => task[update] = req.body[update])
      await task.save()

      // If the task is done, check the other story tasks to see if they're all done
      //if (req.body['status'] === "DONE") {
        const tasks = await Task.find(
          {
            story:storyId,
            $or: [{status: "TODO"}, {status: "IN_PROGRESS"}]
          });

        const story = await Story.findOne({_id:storyId})
        if (tasks && tasks.length === 0) {
          // the story is done
          story.done = true
        } else {
          story.done = false
        }
        await story.save()
      //}

      // Get the story, with all the info populated
      const savedStory = await Story.findOne({_id:storyId}).populate("sprint").populate("backlog").populate("tasks");

      res.status(201).send(savedStory)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

module.exports = router
