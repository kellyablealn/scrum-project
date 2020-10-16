const express = require('express')
const router = new express.Router()
const Project = require('../models/project')

router.get('/projects', async (req, res) => {

    try {
        const projects = await Project.find();

        if (!projects) {
            return res.status(404).send()
        }

        res.send(projects)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.get('/projects/:id', async (req, res) => {

    const _id = req.params.id

    try {
        const project = await Project.findOne({_id });

        if (!project) {
            return res.status(404).send()
        }

        res.send(project)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.delete('/projects/:id', async (req, res) => {
    try {

        const _id = req.params.id

        await Project.findOneAndDelete({_id})

        res.send()
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.post('/projects', async (req, res) => {
    const project = new Project(req.body)

    try {
        await project.save()
        res.status(201).send(project)
    } catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
})

router.put('/projects/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'name', 'startDate', 'endDate', 'gitlabLink', 'gedLink', 'biteableLink', 'status']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
         return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {

        const project = await Project.findOne({ _id: req.params.id})

        if (!project) {
             return res.status(404).send()
        }
        updates.forEach((update) => project[update] = req.body[update])
        await project.save()
        res.send(project)
    } catch (e) {
        console.log(e);
        res.status(400).send(e)
    }
})

module.exports = router
