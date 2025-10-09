let recipient = global.db.data.users[who]
let count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(10, (isNumber(args[0]) ? parseInt(args[0]) : 10)))
if (typeof user.bank !== 'number') user.bank = 0
if (user.bank < count) return m.reply(`ꕥ No tienes suficientes *${currency}* en el banco para transferir.`)
user.bank -= count
if (typeof recipient.bank !== 'number') recipient.bank = 0
recipient.bank += count   
if (isNaN(user.bank)) user.bank = 0
let name = await (async () => global.db.data.users[who].name || (async () => { try { const n = await conn.getName(who); return typeof n === 'string' && n.trim() ? n : who.split('@')[0] } catch { return who.split('@')[0] } })())()
m.reply(`❀ Transferiste *¥${count.toLocaleString()} ${currency}* a *${name}*\n> Ahora tienes *¥${user.bank.toLocaleString()} ${currency}* en total en el banco.`, null, { mentions: [who] })
}

handler.help = ['pay']
handler.tags = ['rpg']
handler.command = ['pay', 'coinsgive', 'givecoins']
handler.group = true

export default handler

function isNumber(x) {
return !isNaN(x)
}