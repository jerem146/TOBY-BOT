import fetch from "node-fetch"
import yts from "yt-search"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `✧ Debes escribir *el nombre o link* del video/audio para descargar.`, m)
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key }})

    let videoIdToFind = text.match(youtubeRegexID) || null
    let ytplay2 = await yts(videoIdToFind ? "https://youtu.be/" + videoIdToFind[1] : text)

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId)
    }

    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2
    if (!ytplay2) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
      return m.reply("⚠︎ No encontré resultados, intenta con otro nombre o link.")
    }

    let { title, thumbnail, timestamp, views, ago, url, author } = ytplay2
    const vistas = formatViews(views)
    const canal = author?.name || "Desconocido"

    const api = await (await fetch(`http://node2.deluxehost.cl:4011/api/download/youtube?url=${encodeURIComponent(url)}`)).json()
    if (!api?.status) throw new Error("La API no devolvió datos")

    const audioData = api.downloads.find(d => d.label === "audio")
    const videoData = api.downloads.find(d => d.label === "normal")
    const thumb = api.metadata?.thumbnail || thumbnail

    const infoMessage = `
> 🧊 *Título* » ${title}
> 🧊 *Canal* » ${canal}
> 🧊 *Duración* » ${timestamp}
> 🧊 *Vistas* » ${vistas}
> 🧊 *Publicado* » ${ago}
> 🧊 *Link* » ${url}
    `.trim()

    const thumbBuffer = (await conn.getFile(thumb))?.data
    await conn.reply(m.chat, infoMessage, m, {
      contextInfo: {
        externalAdReply: {
          title: title,
          body: canal,
          mediaType: 1,
          thumbnail: thumbBuffer,
          renderLargerThumbnail: true,
          mediaUrl: url,
          sourceUrl: url
        }
      }
    })

    if (["play", "yta", "ytmp3", "playaudio"].includes(command)) {
      if (!audioData) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
        return conn.reply(m.chat, "✦ No encontré el audio en la API.", m)
      }

      await conn.sendMessage(m.chat, {
        audio: { url: audioData.url },
        fileName: `${title}.m4a`,
        mimetype: "audio/mp4",
        ptt: true
      }, { quoted: m })

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }})
    }

    else if (["play2", "ytv", "ytmp4", "mp4"].includes(command)) {
      if (!videoData) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
        return conn.reply(m.chat, "✦ No encontré el video 360p en la API.", m)
      }

      await conn.sendFile(m.chat, videoData.url, `${title}.mp4`, `✧ 𝗧𝗶́𝘁𝘂𝗹𝗼 » ${title}`, m)
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }})
    }

    else {
      return conn.reply(m.chat, "✧︎ Comando no válido, revisa el menú.", m)
    }

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
    return m.reply(`⚠︎ Error inesperado:\n\n${error}`)
  }
}

handler.command = handler.help = ["play", "yta", "ytmp3", "play2", "ytv", "ytmp4", "playaudio", "mp4"]
handler.tags = ["descargas"]
handler.group = true

export default handler

// Helper para vistas
function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k`
  return views.toString()
}
