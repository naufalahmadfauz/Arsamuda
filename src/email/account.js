const nodemailer = require('nodemailer')

const sendmail = async (fromEmail,toEmail)=>{
    let transporter = nodemailer.createTransport({
        host: "smtp.mailgun.org",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'postmaster@arsamudaradio.live', // generated ethereal user
            pass: process.env.NODEMAILER_PASS, // generated ethereal password
        },
    });
    // verify connection configuration
    const verifyConnection = await transporter.verify()
    if (verifyConnection){
        return await transporter.sendMail({
            from: fromEmail, // sender address
            to: toEmail, // list of receivers
            subject: "Notifikasi email Arsamuda Radio", // Subject line
            text: "Terimakasih sudah mendaftarkan email anda untuk mengikuti tanggal siaran Arsamuda Radio,stay tune terus untuk tanggal re-launch Arsamuda Radio ya! 😁🙌", // plain text body
        });
    }else {
       throw new Error('Verify email failed')
    }
}
module.exports = sendmail