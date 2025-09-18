import ws from 'ws'

function normalizeJid(jid) {
  if (!jid) return null
  jid = String(jid).toLowerCase()
  jid = jid.replace(/:\d+@/, '@')
  return jid
}

const handler = async (m, { conn, usedPrefix }) => {
  const subBots = [...new Set([...global.conns.filter(
    (conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED
  ).map((conn) => normalizeJid(conn.user.jid))])]

  if (global.conn?.user?.jid && !subBots.includes(normalizeJid(global.conn.user.jid))) {
    subBots.push(normalizeJid(global.conn.user.jid))
  }

  const chat = global.db.data.chats[m.chat]
  const mentionedJid = await m.mentionedJid
  const who = mentionedJid[0] ? mentionedJid[0] : m.quoted ? await m.quoted.sender : false
  if (!who) return conn.reply(m.chat, `❀ Por favor, menciona a un Socket para hacerlo Bot principal del grupo.`, m)

  const whoNorm = normalizeJid(who)
  if (!subBots.includes(whoNorm)) return conn.reply(m.chat, `ꕥ El usuario mencionado no es un Socket de: *${botname}*.`, m)

  if (chat.primaryBot === whoNorm) {
    return conn.reply(m.chat, `ꕥ @${whoNorm.split`@`[0]} ya está como Bot primario en este grupo.`, m, { mentions: [who] })
  }

  try {
    chat.primaryBot = whoNorm
    conn.reply(m.chat, `❀ Se ha establecido a @${whoNorm.split`@`[0]} como Bot primario de este grupo.\n> Ahora todos los comandos de este grupo serán ejecutados por @${whoNorm.split`@`[0]}.`, m, { mentions: [who] })
  } catch (e) {
    conn.reply(m.chat, `⚠︎ Se ha producido un problema.\n> Usa *${usedPrefix}report* para informarlo.\n\n${e.message}`, m)
  }
}

handler.help = ['setprimary']
handler.tags = ['grupo']
handler.command = ['setprimary']
handler.group = true
handler.admin = true

export default handler
