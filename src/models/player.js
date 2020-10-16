const mongoose = require('mongoose')

const playerSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Project'
    },
    startDate: {
        type: Number,
        required: true
    },
    endDate: {
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Player = mongoose.model('Player', playerSchema)

module.exports = Player
