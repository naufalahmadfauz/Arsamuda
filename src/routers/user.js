const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const errorHandler = require('../middleware/errorHandler')
const User = require('../models/User')
const Profile = require('../models/Profile')
const sharp = require('sharp')
const path = require("path");
const fs = require('fs');
const util = require("util")

const {
    createAzureContainer,
    listAzureContainers,
    uploadBlob,
    listBlob,
    downloadBlob,
    deleteBlob
} = require('../functions/imageUpload')
const {
    storageFolder,
    uploadAvatarStorage,
    uploadCover,
    uploadCoverStorage,
    avatarUpload
} = require("../functions/multerConfiguration")
// uploadCoverStorage
uploadAvatarStorage

let renameProfilePicture = async (oldpicturepath, newpicturepath) => {
    let oldpicpath = path.join(__dirname, oldpicturepath)
    let newpicpath = path.join(__dirname, newpicturepath)
    return fs.rename(oldpicpath, newpicpath, (err) => {
        if (err) {
            throw err
        } else {
            console.log('nice')
        }
    })
}

router.post('/coba', avatarUpload.single('avatar'), async (req, res) => {

    try {
        const user = new User({
            email: req.body.email,
            password: req.body.password
        })
        let newPictureName = req.file.filename.substring(0, req.file.filename.length - 4) + '_' + user._id + path.extname(req.file.originalname)
        let pcpath = path.join(__dirname, `../../storage/avatar/${req.file.filename}`)
        let pcpathnew = path.join(__dirname, `../../storage/avatar/${newPictureName}`)

        let promisifyRenameFile = util.promisify(fs.rename)
        let promisifyDeleteFile = util.promisify(fs.unlink)

        await promisifyRenameFile(pcpath, pcpathnew)
        // fs.rename(pcpath,pcpathnew,(err)=>{
        //     if(err){
        //         throw err
        //     }else{
        //

        //         console.log('nice')
        //     }
        // })

        // renameProfilePicture(`../../storage/avatar/${req.file.filename}`, `../../storage/avatar/${newPictureName}`)
        // console.log(pcpathnew)

        // fs.open(pcpathnew, 'r', (err, fd) => {
        //     console.log(fd)
        // });
        let uploadAvatarToBlob = await uploadBlob(pcpathnew, newPictureName)
        let deleteFileAfterUploadBlob = await promisifyDeleteFile(pcpathnew)
        console.log(uploadAvatarToBlob)
        console.log(deleteFileAfterUploadBlob)

        res.send()
    } catch (err) {
        res.send(err)
    }

})

router.post('/signup', avatarUpload.single('avatar'), async (req, res) => {
    const userInput = Object.keys(req.body)
    const allowedInput = ['email', 'password', 'fullName', 'displayName', 'aboutMe', 'birthDate', 'gender', 'avatar']
    const isValidOperation = userInput.every((update) => allowedInput.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({error: 'Bad Inputs'})
    }
    try {
        const user = new User({
            email: req.body.email,
            password: req.body.password
        })

        let newPictureName = req.file.filename.substring(0, req.file.filename.length - 4) + '_' + user._id + path.extname(req.file.originalname)
        let pcpath = path.join(__dirname, `../../storage/avatar/${req.file.filename}`)
        let pcpathnew = path.join(__dirname, `../../storage/avatar/${newPictureName}`)

        let promisifyRenameFile = util.promisify(fs.rename)
        let promisifyDeleteFile = util.promisify(fs.unlink)

        await promisifyRenameFile(pcpath, pcpathnew)

        const profile = new Profile({
            userId: user._id,
            fullName: req.body.fullName,
            displayName: req.body.displayName,
            aboutMe: req.body.aboutMe,
            birthDate: req.body.birthDate,
            gender: req.body.gender,
            avatar: newPictureName
        })
        let uploadAvatarToBlob = await uploadBlob(pcpathnew, newPictureName)
        await user.save()
        await profile.save()
        await promisifyDeleteFile(pcpathnew)
        req.session.userid = user._id.toString()
        console.log(uploadAvatarToBlob)
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
    const allowedUpdates = ['email', 'password']
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

// router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
//     const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
//     req.user.avatar = buffer
//     await req.user.save()
//     res.send(200)
// }, (error, req, res, next) => {
//     res.status(400).send({error: error.message})
// })

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

router.get('/users/me/cover', auth, async (req, res, next) => {
    try {
        // let downloadPicture = await downloadBlob(req.body.coverPicturename)
        let downloadPicture = await downloadBlob(req.body.coverPicturename)
        downloadPicture.pipe(res)
    } catch (e) {
        if (e.message.match(/The specified blob does not exist/)) {
            e.message = 'Picture does not exist.';
            next(e);
        } else {
            next(e);
        }
    }
}, errorHandler)


router.post('/users/me/cover', auth, uploadCover.single('cover'), async (req, res, next) => {
    try {
        const picPath = path.join(__dirname, `../../storage/covers/${req.file.filename}`)
        console.log(await uploadBlob(picPath, req.file.filename))
        res.send({status: "Picture uploaded successfully"})
    } catch (e) {
        next(e)
    }
}, (err, req, res, next) => {
    console.clear()
    if (err.code === 'ENOENT') {
        storageFolder().then(status => console.log('created ', status))
        res.send({err: 'Storage directory does not exist,try again.'})
    } else
        res.send({err: err.message})
})


router.post('/users/me/picpost', auth, uploadCover.array('picpost', 5), async (req, res, next) => {
    console.clear()
    try {
        for (const file of req.files) {
            let picPath = path.join(__dirname, `../../storage/covers/${file.filename}`)
            console.log(file)
            await uploadBlob(picPath, file.filename)
        }

        res.send({status: "Picture uploaded successfully."})
    } catch (e) {
        next('Something went wrong. Please try again.')
    }
}, (err, req, res, next) => {
    if (err.code === 'ENOENT') {
        storageFolder()
        res.send({err: 'Storage directory does not exist,try again.'})
    } else
        res.send({err: err.message})
})


router.delete('/users/me/cover', async (req, res, next) => {
    const deletePicture = await deleteBlob(req.body.pictureName)
    try {
        if (deletePicture.succeeded === true) {
            res.status(deletePicture._response.status).send({status: "File Deleted Successfully.", deletePicture})
        } else {
            throw new Error('Failed to delete picture.')
        }
    } catch (e) {
        e.statusCode = deletePicture._response.status
        next(e)
    }
}, errorHandler)


router.get('/createContainer', async (req, res, next) => {
    const createContainerResponse = await createAzureContainer(req.body.nameContainer)
    console.log(createContainerResponse)
    res.send()
})

router.get('/listContainer', async (req, res, next) => {
    let containers = await listAzureContainers()
    for await (const container of containers) {
        console.log(container.name)
    }
    res.send()
})

router.get('/uploadBlob', async (req, res, next) => {
    const imagePath = path.join(__dirname, '../../public/img/1920.png')
    const uploadRespon = await uploadBlob(imagePath, req.body.pictureName)
    console.log(uploadRespon)
    res.send()
})

router.get('/listBlob', async (req, res, next) => {
    console.clear()
    const listBlobs = await listBlob()

    for await (const iterated of listBlobs) {
        console.log(iterated.name)
    }
    res.send()
})

router.get('/downloadBlob', async (req, res, next) => {
    console.clear()
    try {
        const downloadPicture = await downloadBlob(req.body.pictureName)
        downloadPicture.pipe(res)
    } catch (e) {
        res.status(500).send()
    }
})

router.delete('/deleteBlob', async (req, res, next) => {
    try {
        const deletePicture = await deleteBlob(req.body.pictureName)
        res.send(deletePicture)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router