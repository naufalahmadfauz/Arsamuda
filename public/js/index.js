const playbutton = document.querySelector('#play-radio')
const audiostream = document.querySelector('#live-stream')
const nowplaying = document.querySelector('#now-playing')
playbutton.onclick = ()=>{
    if (playbutton.textContent === 'Play'){
        playbutton.textContent = 'Pause'
        audiostream.play()
    }else {
        playbutton.textContent = 'Play'
        audiostream.pause()
    }
}

const musicmeta = fetch('https://masakasik.me/status-json.xsl').then((response)=>{
    response.json().then((data)=>{
        if (data.icestats.source){
            nowplaying.textContent = `Now Playing : ${data.icestats.source.title}`
            console.log(data.icestats.source)
        }else nowplaying.textContent = `Now Playing : -`

    }).catch((err)=>{
        console.log(err)
    })
})