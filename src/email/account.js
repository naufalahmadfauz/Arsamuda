const mailgun = require("mailgun-js")({apiKey:process.env.MAILGUN_API_KEY,domain:'masakasik.me'})


const sendWelcomeEmail = (email,name)=>{
    mailgun.messages().send({
        to:email,
        from:'supernaufalboy@gmail.com',
        subject:'Terimakasih Telah Bergabung Dengan TheBoyzRadio',
        text:`Selamat datang di TheBoyzRadio, ${name}. Stay tune di TheBoyzRadio!`
    })
}

const sendCancelationEmail = (email,name)=>{
    mailgun.messages().send({
        to:email,
        from:'supernaufalboy@gmail.com',
        subject:'Terimakasih Telah TuneIn di TheBoyzRadio',
        text:`Selamat tinggal, ${name}. Kami sedih melihat anda meninggalkan aplikasi kami. Tolong beritahu kamu untuk menjadi lebih baik kedepannya. Terimakasih!`
    })
}