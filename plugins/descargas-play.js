import fetch from 'node-fetch'

let handler = async (m, { conn, command, args }) => {
  let url = args[0]
  if (!url) return conn.reply(m.chat, "✦ Ingresa un link de YouTube válido.", m)

  if (["play", "playaudio", "yta", "ytmp3", "mp3"].includes(command)) {
    let audioData = null
    try {
      const r = await (await fetch(`https://ruby-core.vercel.app/api/download/youtube/mp3?url=${encodeURIComponent(url)}`)).json()
      if (r?.status && r?.download?.url) {
        audioData = {
          link: r.download.url,
          title: r.metadata?.title || "audio",
          filename: r.download.filename || "audio.mp3"
        }
      }
    } catch {}

    if (!audioData) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
      return conn.reply(m.chat, "✦ No se pudo descargar el audio. Intenta más tarde.", m)
    }

    await conn.sendMessage(m.chat, {
      audio: { url: audioData.link },
      fileName: audioData.filename,
      caption: `✧ 𝗧𝗶́𝘁𝘂𝗹𝗼 » ${audioData.title}`,
      mimetype: "audio/mpeg"
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }})
  }

  else if (["play2", "playvideo", "ytv", "ytmp4", "mp4"].includes(command)) {
    let videoData = null
    try {
      const r = await (await fetch(`https://ruby-core.vercel.app/api/download/youtube/mp4?url=${encodeURIComponent(url)}`)).json()
      if (r?.status && r?.download?.url) {
        videoData = {
          link: r.download.url,
          title: r.metadata?.title || "video",
          filename: r.download.filename || "video.mp4"
        }
      }
    } catch {}

    if (!videoData) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
      return conn.reply(m.chat, "✦ No se pudo descargar el video. Intenta más tarde.", m)
    }

    await conn.sendMessage(m.chat, {
      video: { url: videoData.link },
      fileName: videoData.filename,
      caption: `✧ 𝗧𝗶́𝘁𝘂𝗹𝗼 » ${videoData.title}`,
      mimetype: "video/mp4"
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }})
  }
}

handler.help = ["play", "yta", "ytmp3", "play2", "ytv", "ytmp4"]
handler.tags = ["downloader"]
handler.command = ["play", "yta", "ytmp3", "mp3", "play2", "ytv", "ytmp4", "mp4"]

export default handler
