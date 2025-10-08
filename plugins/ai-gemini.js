import fetch from 'node-fetch'

var handler = async (m, { text, usedPrefix, command, conn }) => {
if (!text) return conn.reply(m.chat, `⚠︎ Ingrese una petición para que Gemini lo responda.`, m)

try {
await m.react('🕒')
conn.sendPresenceUpdate('composing', m.chat)

var apii = await fetch(`https://ruby-core.vercel.app/api/ai/geminis?text=${encodeURIComponent(text)}`)
var res = await apii.json()

if (!res.status || !res.result || !res.result.response) {
return conn.reply(m.chat, `❌ Gemini no pudo obtener una respuesta para "${text}".`, m)
}

await m.reply(`${res.result.response}`)
} catch (e) {
await m.react('❌')
await conn.reply(m.chat, `⚠︎ Gemini no puede responder a esa pregunta.\n\nError: ${e}`, m)
}
}

handler.command = ['gemini']
handler.help = ['gemini <texto>']
handler.tags = ['ai']
handler.group = true
handler.rowner = true

export default handler
