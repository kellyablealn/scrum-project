const express = require('express')
const router = new express.Router()
const Backlog = require('../models/backlog')

router.get('/backlog', async (req, res) => {

    try {
        const items = await Backlog.find().populate("project");

        if (!items) {
            return res.status(404).send()
        }

        res.send(items)
    } catch (e) {
        console.log(e);
        res.status(500).send()
    }
})

router.get('/backlog/:id', async (req, res) => {

    const _id = req.params.id

    try {
        const item = await Backlog.findOne({_id }).populate("project")

        if (!item) {
            return res.status(404).send()
        }

        res.send(item)
    } catch (e) {
        console.log(e);
        res.status(500).send()
    }
})

router.get('/backlog/project/:id', async (req, res) => {

    const _id = req.params.id

    try {
        const items = await Backlog.find({project:{_id} }).populate("project")

        if (!items) {
            return res.status(404).send()
        }

        res.send(items)
    } catch (e) {
        console.log(e);
        res.status(500).send()
    }
})

router.delete('/backlog/:id', async (req, res) => {
    try {

        const _id = req.params.id

        await Backlog.findOneAndDelete({_id})

        res.send()
    } catch (e) {
        console.log(e);
        res.status(500).send()
    }
})

router.put('/backlog/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'priority', 'effort', 'active', 'prototypeLink', 'done']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
         return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {

        const backlog = await Backlog.findOne({ _id: req.params.id})

        if (!backlog) {
             return res.status(404).send()
        }
        updates.forEach((update) => backlog[update] = req.body[update])

        await backlog.save()
        res.send(backlog)
    } catch (e) {
        console.log(e);
        res.status(400).send(e)
    }
})

router.post('/backlog', async (req, res) => {
    const item = new Backlog(req.body)

    try {
        await item.save()
        res.status(201).send(item)
    } catch (e) {
        console.log(e);
        res.status(400).send(e)
    }
})

module.exports = router
