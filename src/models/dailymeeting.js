const mongoose = require('mongoose')

const dailymeetingSchema = new mongoose.Schema({
    sprint: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Sprint'
    },
    day: {
        type: Number,
        required: true
    },
    finished: {
        type: Boolean,
    },
    order: {
        type: Number,
    },
    planned: {
        type: Number
    },
    executed: {
        type: Number
    },
}, {
    timestamps: true
})

const DailyMeeting = mongoose.model('Dailymeeting', dailymeetingSchema)

module.exports = DailyMeeting
