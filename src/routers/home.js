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
        console.log(req.body)
        res.status(200).render('coming_soon',{titlepage:'Sukses'})
        // res.status(201).send('Saved')
    }catch (e){
        res.status(500).send(e)
    }
})

router.get('/live',async (req,res) => {
    res.render('home')
})


module.exports = router