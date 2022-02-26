const express = require("express");
const router = new express.Router()
const Mail = require('../models/Mailing')

router.get('/',async (req,res) => {
    res.render('coming_soon')
})

router.post('/subscribe',async (req,res)=>{
    const mail = new Mail(req.body)
    try {
        await mail.save()
        res.status(201).send('Saved')
    }catch (e){
        res.status(500).send(e.errors.email.message)
    }
})

router.get('/live',async (req,res) => {
    res.render('home')
})


module.exports = router