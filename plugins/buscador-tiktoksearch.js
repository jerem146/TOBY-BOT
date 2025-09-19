import axios from 'axios'
import baileys from '@whiskeysockets/baileys'

const { generateWAMessageFromContent } = baileys

async function sendAlbumMessage(jid, medias, options = {}) {
  if (typeof jid !== "string") throw new TypeError(`jid must be string, received: ${jid}`)
  if (medias.length < 2) throw new RangeError("Se necesitan al menos 2 videos para un álbum")

  const caption = options.text || options.caption || ""
  const delay = !isNaN(options.delay) ? options.delay : 500
  delete options.text
  delete options.caption
  delete options.delay

  const album = baileys.generateWAMessageFromContent(
    jid,
    { messageContextInfo: {}, albumMessage: { expectedImageCount: medias.length } },
    {}
  )

  await conn.relayMessage(album.key.remoteJid, album.message, { messageId: album.key.id })

  for (let i = 0; i < medias.length; i++) {
    const { type, data } = medias[i]
    const msg = await baileys.generateWAMessage(
      album.key.remoteJid,
      { [type]: data, ...(i === 0 ? { caption } : {}) },
      { upload: conn.waUploadToServer }
    )
    await conn.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id })
    await baileys.delay(delay)
  }
  return album
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `${emoji} Por favor, ingrese lo que desea buscar en tiktok.`, m)
  }

  try {
    await m.react(rwait)
    conn.reply(m.chat, `${emoji2} Descargando sus videos, espere un momento...`, m)

    let { data: response } = await axios.get('https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=' + text)
    let searchResults = response.data

    if (!Array.isArray(searchResults) || searchResults.length < 2) {
      return conn.reply(m.chat, '💦 No encontré suficientes resultados para mostrar un álbum.', m)
    }

    searchResults.sort(() => Math.random() - 0.5)
    let selectedResults = searchResults.slice(0, 5)

    const medias = selectedResults.map(video => ({
      type: "video",
      data: { url: video.nowm }
    }))

    const caption = `${emoji} Resultado de: ${text}\n⪛✰ TikTok - Búsquedas ✰⪜`

    await sendAlbumMessage(m.chat, medias, { caption, quoted: m })
    await m.react(done)

  } catch (error) {
    console.error(error)
    await conn.reply(m.chat, error.toString(), m)
  }
}

handler.help = ['tiktoksearch <txt>']
handler.tags = ['buscador']
handler.command = ['tiktoksearch', 'ttss', 'tiktoks']
handler.group = true
handler.register = true
handler.coin = 2

export default handler
