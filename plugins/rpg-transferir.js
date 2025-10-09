let handler = async (m, { conn, args, usedPrefix, command }) => {
    let who
    if (m.isGroup) {
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    } else { 
        who = m.chat
    }

    if (!who) return m.reply(` etiquete al usuario a quien desea transferir. Ejemplo: *${usedPrefix + command} @usuario 100*`)
    
    let amount = parseInt(args[1])
    if (!amount || isNaN(amount) || amount <= 0) return m.reply(` ingrese una cantidad válida y mayor que cero. Ejemplo: *${usedPrefix + command} @usuario 100*`)

    if (who === m.sender) return m.reply(' no puedes transferirte monedas a ti mismo.')

    let user = global.db.data.users[m.sender]
    let recipient = global.db.data.users[who]

    if (typeof recipient.bank !== 'number') recipient.bank = 0

    if (user.bank < amount) return m.reply(` no tienes suficientes monedas en el banco para realizar esta transferencia.`)

    user.bank -= amount
    recipient.bank += amount

    let name = await conn.getName(who)
    let currency = '💰 Monedas'
    m.reply(`✅ Transferiste exitosamente *${amount.toLocaleString()} ${currency}* a *${name}*.\n\n> Tu nuevo saldo en el banco es de *${user.bank.toLocaleString()} ${currency}*.`, null, { mentions: [who] })
}

handler.help = ['pay @usuario [cantidad]']
handler.tags = ['rpg']
handler.command = ['pay', 'transferir', 'darcoins']
handler.group = true
handler.register = true

export default handler