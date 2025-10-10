import fetch from 'node-fetch'

const handler = async (m, { text, conn, args, usedPrefix, command }) => {
  const emoji = '🌸'
  const emoji2 = '❌'
  const msm = '⚠️'
  const done = '✅'
  const rwait = '⏳'

  if (!args[0]) {
    return conn.reply(
      m.chat,
      `${emoji} 𝐏𝐨𝐫 𝐟𝐚𝐯𝐨𝐫, 𝐢𝐧𝐠𝐫𝐞𝐬𝐚 𝐮𝐧 𝐞𝐧𝐥𝐚𝐜𝐞 𝐝𝐞 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤.\n\nEjemplo:\n> *${usedPrefix + command} https://www.facebook.com/...*`,
      m
    )
  }

  try {
    await m.react(rwait)

    const apiUrl = `https://ruby-core.vercel.app/api/download/facebook?url=${encodeURIComponent(args[0])}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json.status || !json.download) {
      await m.react('⚠️')
      return conn.reply(m.chat, `${emoji2} No se pudo obtener el video, verifica el enlace.`, m)
    }

    const { title, description, siteName } = json.metadata
    const videoUrl = json.download

    const caption = `
╭━〔🌸 𝑹𝒖𝒃𝒚 𝑯𝒐𝒔𝒉𝒊𝒏𝒐 - 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝𝐞𝐫 🌸〕━╮
┃ 📺 *Título:* ${title ? title : 'Sin título'}
┃ 📝 *Descripción:* ${description ? description : 'Sin descripción'}
┃ 🌐 *Origen:* ${siteName ? siteName : 'Facebook'}
┃ 👩🏻‍💻 *API:* Ruby Core by Dioneibi
╰━━━━━━━━━━━━━━━━━━━━━━━╯

${emoji} *Aquí tienes tu video de Facebook~ 💕*
`.trim()

    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption,
        fileName: 'facebook_video.mp4',
        mimetype: 'video/mp4',
        contextInfo: {
          externalAdReply: {
            title: '🌸 Ruby Hoshino Downloader 🌸',
            body: 'Descarga directa desde Facebook',
            thumbnailUrl: 'https://telegra.ph/file/95c0cc90d069fea2cdf0d.png',
            sourceUrl: 'https://ruby-core.vercel.app/',
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    )

    await m.react(done)
  } catch (e) {
    console.error(e)
    await m.react('⚠️')
    return conn.reply(m.chat, `${msm} Error al procesar el video.`, m)
  }
}

handler.help = ['facebook', 'fb']
handler.tags = ['descargas']
handler.command = ['facebook', 'fb']
handler.group = true
handler.register = true
handler.coin = 2

export default handler
