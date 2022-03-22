const express = require("express");
const router = new express.Router()
const Mail = require('../models/Mailing')
const fetch = require('node-fetch')
const sendmail = require('../email/account')

router.get('/', async (req, res) => {
    const titlepage = req.session.titlepage
    console.log(req.socket.remoteAddress)
    res.render('coming_soon',{titlepage,ingfo:req.flash('ingfo')})
})

router.post('/subscribe', async (req, res) => {
    const mail = new Mail(req.body)

    const secrettoken = process.env.CAPTCHA_SECRET
    const clienttoken = req.body['g-recaptcha-response']
    const clientIP = req.ip

    const params = new URLSearchParams();
    params.append('secret', secrettoken);
    params.append('response', clienttoken)
    params.append('remoteip', clientIP)
    const responsecaptcha = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: params
    });
    const dataCaptcha = await responsecaptcha.json();

    if (dataCaptcha.success !== false) {
        try {
            await mail.save()
            await sendmail('supernaufalboy@gmail.com',req.body['email'])
            req.session.titlepage ='Sukses'
            res.status(201).redirect('/')
            // res.status(200).render('coming_soon', {titlepage: 'Sukses'})
        } catch (e) {
            res.status(500).send(e)
        }
    }else {
        req.session.titlepage ='Gagal'
        res.redirect('/')
        // res.status(200).render('coming_soon', {titlepage: 'Failed'})
    }

})

router.get('/live', async (req, res) => {
    res.redirect('/')
    // res.render('home')
})
module.exports = router