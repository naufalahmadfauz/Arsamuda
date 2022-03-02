const express = require("express");
const router = new express.Router()
const Mail = require('../models/Mailing')
const fetch = require('node-fetch')

router.get('/',async (req,res) => {
    res.render('coming_soon')
})

router.post('/subscribe',async (req,res)=>{
    const mail = new Mail(req.body)
    const secrettoken = process.env.CAPTCHA_SECRET
    const clienttoken = req.body['g-recaptcha-response']
    const clientIP = req.ip
    try {
        const params = new URLSearchParams();
        params.append('secret', secrettoken);
        params.append('response',clienttoken)
        params.append('remoteip',clientIP)
        const responsecaptcha = await fetch('https://www.google.com/recaptcha/api/siteverify', {method: 'POST', body: params});
        const dataCaptcha = await responsecaptcha.json();
        if (dataCaptcha.success !==false) {
            await mail.save()
            res.status(200).render('coming_soon',{titlepage:'Sukses'})
        }else {
            res.status(200).render('coming_soon',{titlepage:'failed'})
        }
        // res.status(201).send(params.toString())
    }catch (e){
        res.status(500).send(e)
    }
})

router.get('/live',async (req,res) => {
    res.render('home')
})
module.exports = router