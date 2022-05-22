const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/User')
const multer = require('multer')
const sharp = require('sharp')


const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File Must an image'))
        }
        cb(undefined, true)
    }
})

const uploadCover = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File Must an image'))
        }
        cb(undefined, true)
    }
})

router.post('/signup', async (req, res) => {
    const user = new User(req.body)
    console.log(user)
    const userInput = Object.keys(req.body)
    const allowedInput = ['nama', 'email', 'password', 'biodata', 'tglLahir']
    const isValidOperation = userInput.every((update) => allowedInput.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({error: 'Bad Inputs'})
    }
    try {
        await user.save()
        req.session.userid = user._id.toString()
        res.status(201).send({user})
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        req.session.userid = user._id.toString()
        res.send({user})
    } catch (e) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.session.destroy(() => {
            res.status(200).send()
        })
    } catch (e) {
        res.status(500).send()
    }
})
//TODO
//Implement logoutAll

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
        const updates = Object.keys(req.body)
        const allowedUpdates = ['nama', 'email', 'password', 'biodata', 'tglLahir']
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

        if (!isValidOperation) {
            return res.status(400).send({error: 'Invalid updates'})
        }

        try {
            updates.forEach((update => req.user[update] = req.body[update]))
            await req.user.save()
            res.send(req.user)
        } catch (e) {
            res.status(400).send(e)
        }
    })

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send(200)
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar) {
            throw new Error('No user or avatar found')
        }

        res.set('Content-Type', 'image/png').send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

router.post('/users/me/cover', auth, async (req,res)=>{
    try{

    }catch (e) {

    }
})

module.exports = router