const mongoose = require('mongoose')

const storySchema = new mongoose.Schema({
    backlog: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Backlog'
    },
    totalHours: {
        type: Number
    },
    color: {
        type: String
    },
    sprint: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Sprint'
    },
    done: {
      type: Boolean
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
      }
    ]
}, {
    timestamps: true
})

const Story = mongoose.model('Story', storySchema)

module.exports = Story
