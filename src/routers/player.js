const express = require('express')
const router = new express.Router()
const Player = require('../models/player')

router.get('/players', async (req, res) => {

    try {
        const players = await Player.find().populate("project").populate("user");

        if (!players) {
            return res.status(404).send()
        }

        res.send(players)
    } catch (e) {
        console.log(e);
        res.status(500).send()
    }
})

router.get('/players/project/:id', async (req, res) => {

    const _id = req.params.id

    try {
        const players = await Player.find({project:{_id} }).populate("project").populate("user");

        if (!players) {
            return res.status(404).send()
        }

        res.send(players)
    } catch (e) {
        console.log(e);
        res.status(500).send()
    }
})

router.get('/players/:id', async (req, res) => {

    const _id = req.params.id

    try {
        const player = await Player.findOne({_id }).populate("project").populate("user");

        if (!player) {
            return res.status(404).send()
        }

        res.send(player)
    } catch (e) {
        console.log(e);
        res.status(500).send()
    }
})

router.put('/players/:id', async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['startDate', 'endDate']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
         return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {

        const player = await Player.findOne({ _id: req.params.id})

        if (!player) {
             return res.status(404).send()
        }
        updates.forEach((update) => player[update] = req.body[update])

        await player.save()

        const playerSaved = await Player.findOne({ _id: req.params.id}).populate("project").populate("user");

        res.send(playerSaved)
    } catch (e) {
        console.log(e);
        res.status(400).send(e)
    }
})

router.delete('/players/:id', async (req, res) => {
    try {

        const _id = req.params.id

        await Player.findOneAndDelete({_id})

        res.send()
    } catch (e) {
        console.log(e);
        res.status(500).send()
    }
})

router.post('/players', async (req, res) => {
    const player = new Player(req.body)

    try {
        await player.save()
        const savedPlayer = await Player.findOne({_id: player._id }).populate("project").populate("user");

        res.status(201).send(savedPlayer)
    } catch (e) {
        console.log(e);
        res.status(400).send(e)
    }
})


module.exports = router
