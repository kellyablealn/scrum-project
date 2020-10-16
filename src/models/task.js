const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    hours: {
        type: Number,
        required: true
    },
    status: {
        type: String,
    },
    doneAt: {
        type: Number
    },
    doneBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    story: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Story'
    }
}, {
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
