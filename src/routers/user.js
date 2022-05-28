const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/User')
const multer = require('multer')
const sharp = require('sharp')
const randomString = require('randomstring')
const path = require("path");
const {createAzureContainer,listAzureContainers,uploadBlob,listBlob,downloadBlob,deleteBlob} = require('../functions/imageUpload')

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

const uploadCoverStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'storage/covers')
    },
    filename: function (req, file, cb) {
        const extfilename = path.extname(file.originalname)
        cb(null, file.fieldname + '_' + Date.now() + '_' + randomString.generate({length: 5}) + extfilename)
    }
})

const uploadCover = multer({
    storage: uploadCoverStorage,

    limits: {
        fileSize: 10000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('File Must an image'))
        }
        cb(null, true)
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

router.get('/users/me/cover',auth, async (req, res) => {
    try {
        let downloadPicture = await downloadBlob(req.body.coverPicturename)
        downloadPicture.pipe(res)
    }catch (e) {
        res.status(404).send(e)
    }
})

router.post('/users/me/cover', auth, uploadCover.single('cover'), async (req, res, next) => {
    try {
        const picPath = path.join(__dirname,`../../storage/covers/${req.file.filename}`)
        const uploadPicCover = await uploadBlob(picPath,req.file.filename)
        console.clear()
        console.log(req.file)
        console.log(uploadPicCover)
        res.send('ok')
    } catch (e) {
        res.status(500).send(e)
    }
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/users/me/cover', async (req, res) => {
    try {
        const deletePicture = await deleteBlob(req.body.pictureName)
        console.log(deletePicture)
        res.sendStatus(200)
    }catch (e) {
        res.status(404).send(e)
    }
})



router.get('/createContainer',async (req, res,next)=>{
    const createContainerResponse = await createAzureContainer(req.body.nameContainer)
    console.log(createContainerResponse)
    res.send()
})

router.get('/listContainer',async (req, res,next)=>{
    let containers = await listAzureContainers()
    for await (const container of containers){
        console.log(container.name)
    }
    res.send()
})

router.get('/uploadBlob',async (req, res,next) => {
    const imagePath = path.join(__dirname,'../../public/img/1920.png')
    const uploadRespon = await uploadBlob(imagePath,req.body.pictureName)
    console.log(uploadRespon)
    res.send()
})

router.get('/listBlob', async (req, res,next)=>{
    console.clear()
    const listBlobs = await listBlob()

    for await (const iterated of listBlobs){
        console.log(iterated.name)
    }
    res.send()
})

router.get('/downloadBlob',async (req, res,next) =>{
    console.clear()
    try {
        const downloadPicture = await downloadBlob(req.body.pictureName)
        downloadPicture.pipe(res)
    }catch (e) {
        res.status(500).send()
    }
})

router.delete('/deleteBlob',async (req, res,next) =>{
    try{
        const deletePicture = await deleteBlob(req.body.pictureName)
        res.send(deletePicture)
    }catch (e) {
        res.status(500).send()
    }
})

module.exports = router