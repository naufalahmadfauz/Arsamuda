const path = require("path")
const util = require("util")
const fs = require("fs")
const multer = require("multer")
const randomString = require("randomstring")

//this function check if directory exists,if not, then create one. it returns promise
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

//this function configure for single upload,it doesn't use storage setting because it the function that use this function store the picture into mongodb as buffer '
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
//this function makes configuration for storing file. this utilize diskstore so it will store the file in disk.
const uploadCoverStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'storage/covers')
    },
    filename: function (req, file, cb) {
        const extfilename = path.extname(file.originalname)
        cb(null, file.fieldname + '_' + Date.now() + '_' + randomString.generate({length: 5}) + extfilename)
    }
})
//this funcion set uploadCover with configured storage
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