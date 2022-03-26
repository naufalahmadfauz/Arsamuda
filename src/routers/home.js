const express = require("express");
const router = new express.Router()
const Mail = require('../models/Mailing')
const fetch = require('node-fetch')
const sendmail = require('../email/account')
let dayjs = require('dayjs')
router.get('/', async (req, res) => {
    let countdown = dayjs().diff('2022-05-04','day').toString().slice(1)
    res.render('coming_soon',{
        titlepage:'Coming Soon',
        flash:req.flash('flash'),
        flash_title:req.flash('flash-title'),
        flash_message:req.flash('flash-message'),
        countdown
    })
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
            await sendmail('naufalahmadfauz@gmail.com',req.body['email'])
            req.flash('flash', 'success')
            req.flash('flash-title','Sukses')
            req.flash('flash-message','Selamat anda telah sukses berlangganan!')
            res.status(201).redirect('/')
        } catch (e) {
            req.flash('flash', 'error')
            req.flash('flash-title','Gagal')
            req.flash('flash-message','Terjadi kesalahan server,coba lagi!')
            res.status(500).redirect('/')
        }
    }else {
        req.flash('flash', 'error')
        req.flash('flash-title','Gagal')
        req.flash('flash-message','Captcha gagal silahkan ulangi kembali')
        res.status(304).redirect('/')
    }
})

router.get('/live', async (req, res) => {
    res.redirect('/')
})
module.exports = router