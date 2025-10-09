let handler = async (m, { conn, args, usedPrefix, command }) => {
    let who
    if (m.isGroup) {
        who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    } else { 
        who = m.chat
    }

    if (!who) return m.reply(`Etiquete al usuario a quien desea transferir.\n\n*Ejemplo:* ${usedPrefix + command} @usuario 100`)
    
    if (!global.db.data.users[who]) {
        return m.reply(`El usuario no está registrado en la base de datos.`);
    }

    let amount = parseInt(args[1])
    if (!amount || isNaN(amount) || amount <= 0) return m.reply(`Ingrese una cantidad válida y mayor que cero.\n\n*Ejemplo:* ${usedPrefix + command} @usuario 100`)

    if (who === m.sender) return m.reply('No puedes transferirte monedas a ti mismo.')

    
    let senderBank = global.db.data.users[m.sender].bank
    if (senderBank < amount) return m.reply(`No tienes suficientes monedas en el banco para realizar esta transferencia.`)

    if (typeof global.db.data.users[who].bank !== 'number') {
        global.db.data.users[who].bank = 0
    }

    global.db.data.users[m.sender].bank -= amount
    global.db.data.users[who].bank += amount

    let name = await conn.getName(who)
    let currency = '💰 Monedas'
    let newSenderBalance = global.db.data.users[m.sender].bank

    m.reply(`✅ Transferiste exitosamente *${amount.toLocaleString()} ${currency}* a *${name}*.\n\n> Tu nuevo saldo en el banco es de *${newSenderBalance.toLocaleString()} ${currency}*.`, null, { mentions: [who] })
}

handler.help = ['pay @usuario [cantidad]']
handler.tags = ['rpg']
handler.command = ['pay', 'transferir', 'darcoins']
handler.group = true
handler.register = true 

export default handler