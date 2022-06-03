const path = require("path")
const util = require("util")
const fs = require("fs")
const multer = require("multer")
const randomString = require("randomstring")

const storageFolder = async () => {
    const pathtopic = path.join(__dirname, '../../storage/covers')
    try {
        const statsFolderPromisified = util.promisify(fs.stat)
        await statsFolderPromisified(pathtopic)
        return ('Folder exists')
    } catch (e) {
        return fs.mkdir(pathtopic, {recursive: true}, (err) => {
            if (err) throw err
        })
    }
}
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

module.exports = {storageFolder, uploadCover,uploadCoverStorage,upload}