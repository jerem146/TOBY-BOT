let handler = async (m, { conn, args, usedPrefix, command }) => {
    const currency = '💎';

    let mentionedJid = m.mentionedJid || [];
    const who = m.quoted 
        ? m.quoted.sender 
        : (mentionedJid[0] || (args[1] ? (args[1].replace(/[@ .+-]/g, '') + '@s.whatsapp.net') : ''));

    if (!args[0]) 
        return conn.reply(m.chat, `❀ Debes mencionar a quien quieras regalar *${currency}*.\n> Ejemplo » *${usedPrefix + command} 25000 @mencion*`, m);

    if (!isNumber(args[0]) && args[0].startsWith('@')) 
        return conn.reply(m.chat, `ꕥ Primero indica la cantidad que deseas transferir, seguido de la persona.\n> Ejemplo » *${usedPrefix + command} 1000 @mencion*`, m);

    if (!who) 
        return conn.reply(m.chat, `ꕥ Debes mencionar a alguien para transferir *${currency}*.`, m);

    if (!(who in global.db.data.users)) 
        return conn.reply(m.chat, `ꕥ El usuario no está en la base de datos.`, m);

    let user = global.db.data.users[m.sender];
    let recipient = global.db.data.users[who];
    let count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(10, (isNumber(args[0]) ? parseInt(args[0]) : 10)));

    if (typeof user.bank !== 'number') user.bank = 0;
    if (typeof recipient.bank !== 'number') recipient.bank = 0;

    if (user.bank < count) 
        return conn.reply(m.chat, `ꕥ No tienes suficientes *${currency}* en el banco para transferir.`, m);

    user.bank -= count;
    recipient.bank += count;

    let name = await conn.getName(who).catch(() => who.split('@')[0]);
    let name2 = await conn.getName(m.sender).catch(() => m.sender.split('@')[0]);

    m.react('💸');

    let mensaje = `❀ ${name2} transferiste *${count.toLocaleString()} ${currency}* a ${name}\n> Ahora tienes *${user.bank.toLocaleString()} ${currency}* en tu banco.`;
    await conn.reply(m.chat, mensaje, m, { mentions: [who] });
};

handler.help = ['pay'];
handler.tags = ['rpg'];
handler.command = ['pay', 'coinsgive', 'givecoins'];
handler.group = true;

export default handler;

function isNumber(x) {
    return !isNaN(x);
}
