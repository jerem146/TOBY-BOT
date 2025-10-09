let handler = async (m, { conn, text }) => {
    let who;

    if (m.quoted) {
        who = m.quoted.sender;
    } 
    else if (m.mentionedJid && m.mentionedJid[0]) {
        who = m.mentionedJid[0];
    } 
    else {
        return m.reply(`*⚠️ Debes responder al mensaje de un usuario o mencionarlo para añadirle coins.*`);
    }

    who = conn.decodeJid(who);

    let txt = text.replace(/@\d{5,}/g, '').trim();
    if (!txt) return m.reply(`*⚠️ Debes ingresar la cantidad de coins que quieres añadir.*`);
    if (isNaN(txt)) return m.reply(`*⚠️ La cantidad debe ser un número.*`);

    let amount = parseInt(txt);
    if (amount < 1) return m.reply(`*⚠️ La cantidad mínima para añadir es 1.*`);

    if (!global.db.data.users[who]) {
        global.db.data.users[who] = { coin: 0 };
    }

    global.db.data.users[who].coin = (global.db.data.users[who].coin || 0) + amount;

    await conn.sendMessage(m.chat, {
        text: `*✅ Transacción exitosa!*\n\n*Cantidad:* ${amount} 💸\n*Para:* @${who.split('@')[0]}`,
        mentions: [who]
    }, { quoted: m });
};

handler.help = ['addcoins <@usuario> <cantidad>'];
handler.tags = ['owner'];
handler.command = ['añadircoin', 'addcoin', 'addcoins'];
handler.rowner = true;

export default handler;