const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/User')
const multer = require('multer')
const sharp = require('sharp')
const randomString = require('randomstring')
const path = require("path");
const {BlobServiceClient} = require("@azure/storage-blob");
const util = require('util')
const {createReadStream, createWriteStream, pipe} = require('fs')
//connection string dari storage accout
// const connStr = "DefaultEndpointsProtocol=https;AccountName=arsamudaazurestorage;AccountKey=QZRUx8cPlhYMJtLhpWZOahP0xKSqCdvYFTPYbArjMIbjmTqwS+rkgUfLGWqdHX6cG0ZNhGqy3R43mcOawU1wXw==;EndpointSuffix=core.windows.net";
const connStr = "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1";
//inisialisasi atau buka koneksi ke azure dengan connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);
const containerName = "arsamudapicturestorage";
const containerClient = blobServiceClient.getContainerClient(containerName);
const blobName = "Capture.PNG";

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
        cb(null, 'covers')
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

router.post('/users/me/cover', auth, uploadCover.single('cover'), async (req, res, next) => {
    try {
        res.send('ok')
    } catch (e) {
        res.status(500).send(e)
    }
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})


router.get('/createazurecontainer', async (req, res, next) => {
    //dapatkan nama container dari containername dengna koneksi yang sudah dibuka dari blobserviceclient

    //upload query buat bikin container nya ke azure,fungsi asyncronous karena butuh waktu
    const createContainerResponse = await containerClient.create();
    console.log(`Create container ${containerName} successfully`, createContainerResponse.requestId)

    res.send()
})

router.get('/listazurecontainer', async (req, res, next) => {
    let i = 1;
    let containers = blobServiceClient.listContainers();
    for await (const container of containers) {
        console.log(`Container ${i++}: ${container.name}`);
    }
    res.send()
})

router.get('/uploadblob', async (req, res, next) => {
    try {

        const imagepath = path.join(__dirname, '../../public/img/meme.jpg')
        const pic = createReadStream(imagepath, {highWaterMark: 8000000})

        const blockBlobClient = containerClient.getBlockBlobClient(req.body.pictureName);
        const uploadBlobResponse = await blockBlobClient.uploadStream(pic);
        console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);

        res.status(201).send('OK')
    } catch (err) {
        res.status(400).send('NOT OK')
    }
})

router.get('/listblobs', async (req, res, next) => {
    let i = 1;
    let blobs = containerClient.listBlobsFlat();
    for await (const blob of blobs) {
        console.log(`Blob ${i++}: ${blob.name}`);
    }
    res.send()
})

router.get('/downloadblob', async (req, res, next) => {
    try {
        const blobClient = containerClient.getBlobClient(req.body.pictureName);
        const downloadBlockBlobResponse = await blobClient.download(0)
        console.log("Downloaded blob content", downloadBlockBlobResponse.readableStreamBody);
        downloadBlockBlobResponse.readableStreamBody.pipe(res)
    } catch (e) {
        res.status(404).send('Not Found')
    }

})


module.exports = router