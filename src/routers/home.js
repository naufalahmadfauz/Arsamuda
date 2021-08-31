const express = require("express");
const router = new express.Router()



router.get('/',async (req,res) => {
    res.render('index')
})
router.get('/live',async (req,res) => {
    res.render('home')
})


module.exports = router