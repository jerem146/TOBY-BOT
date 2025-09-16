import ws from 'ws'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let chat = global.db.data.chats[m.chat]

  if (m.mentionedJid.length === 0) {
    let reset = text?.toLowerCase() === 'reset' || text?.toLowerCase() === 'restablecer'
    if (reset) {
      if (!chat.botPrimario) return m.reply('《✧》 No hay ningún bot primario establecido en este grupo.')

      console.log(`[Bot Primario] Reseteando configuración para el chat: ${m.chat}`)
      chat.botPrimario = null
      await m.reply(`✐ Se ha restablecido la configuración. Ahora todos los bots responderán nuevamente en este grupo.`)
      return
    }

    return m.reply(
      `《✧》 Debes mencionar a un bot del grupo para establecerlo como primario.\n\n` +
      `> *Ejemplo:* ${usedPrefix + command} @tagdelbot\n\n` +
      `> ❀ También puedes usar *resetbot* (SIN PREFIJOS) para que todos los bots vuelvan a responder.`
    )
  }

  let botJid = m.mentionedJid[0]

  // Buscar entre los bots conectados
  const users = [
    ...new Set(
      global.conns.filter(c =>
        c.user &&
        c.ws?.socket &&
        c.ws.socket.readyState !== ws.CLOSED
      )
    )
  ]

  let selectedBot

  // Si el bot mencionado es el actual
  if (botJid === conn.user.jid || botJid === global.conn?.user?.jid) {
    selectedBot = conn
  } else {
    selectedBot = users.find(sub => sub.user?.jid === botJid)
  }

  // Antes aquí se bloqueaba si no era de Ruby-Hoshino, ahora lo permitimos
  if (!selectedBot) {
    return conn.reply(m.chat, `✧ El usuario mencionado no parece estar conectado como bot.`, m)
  }

  if (chat.botPrimario === botJid) {
    return conn.reply(m.chat, `✧ @${botJid.split('@')[0]} ya es el bot primario.`, m, { mentions: [botJid] })
  }

  chat.botPrimario = botJid
  console.log(`[Bot Primario SET] Chat: ${m.chat} | JID Guardado: ${botJid}`)

  let botName = await conn.getName(botJid)
  let response = `✐ Se ha establecido a *@${botJid.split('@')[0]}* como bot primario de este grupo.
> A partir de ahora, todos los comandos del grupo serán ejecutados únicamente por *@${botJid.split('@')[0]}*.

> *Nota:* Si sucede algún inconveniente, puedes restablecer la configuración usando el comando \`resetbot\` (sin prefijo).`

  await conn.sendMessage(
    m.chat,
    { text: response, mentions: [botJid] },
    { quoted: m }
  )
}

handler.help = ['setbotprimario @bot', 'setbot @bot']
handler.tags = ['grupo']
handler.command = ['setprimary', 'botprimario', 'setprimarybot', 'setbot']
handler.group = true
handler.admin = true

export default handler
