const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        trim: true,
        required: true
    },
    startDate: {
        type: Number,
        required: true
    },
    endDate: {
        type: Number
    },
    bitableLink: {
        type: String
    },
    gedLink: {
        type: String
    },
    gitlabLink: {
        type: String
    }
}, {
    timestamps: true
})

const Project = mongoose.model('Project', projectSchema)

module.exports = Project
