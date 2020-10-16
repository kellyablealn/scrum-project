const mongoose = require('mongoose')

const sprintSchema = new mongoose.Schema({
    goal: {
        type: String,
        trim: true,
        required: true
    },
    status: {
      type: String,
    },
    startDate: {
        type: Number,
        required: true
    },
    endDate: {
        type: Number
    },
    totalEffort: {
        type: Number
    },
    workHours: {
        type: Number
    },
    totalHours: {
        type: Number
    },
    dailyLink: {
      type: String
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    team: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
}, {
    timestamps: true
})

const Sprint = mongoose.model('Sprint', sprintSchema)

module.exports = Sprint
