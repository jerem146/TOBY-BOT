ilet handler = async (m, { conn, args, usedPrefix, command }) => {
  try {
    const currency = '💎';
    const mentionedJid = m.mentionedJid?.[0] 
        || (m.quoted ? m.quoted.sender : null);

    if (!args[0]) 
      return conn.reply(m.chat, `❀ Debes mencionar a quien quieras regalar *${currency}*.\n> Ejemplo » *${usedPrefix + command} 25000 @usuario*`, m);

    if (!mentionedJid) 
      return conn.reply(m.chat, `ꕥ Debes mencionar a alguien para transferir *${currency}*.`, m);

    if (!(mentionedJid in global.db.data.users))
      return conn.reply(m.chat, `ꕥ El usuario no está registrado en la base de datos.`, m);

    const user = global.db.data.users[m.sender];
    const receiver = global.db.data.users[mentionedJid];
    const count = parseInt(args[0]);

    if (isNaN(count) || count <= 0) 
      return conn.reply(m.chat, `ꕥ Ingresa una cantidad válida de *${currency}* para transferir.`, m);

    if (typeof user.bank !== 'number') user.bank = 0;
    if (typeof receiver.bank !== 'number') receiver.bank = 0;

    if (user.bank < count) 
      return conn.reply(m.chat, `ꕥ No tienes suficientes *${currency}* en tu banco.`, m);

    user.bank -= count;
    receiver.bank += count;

    const senderName = await conn.getName(m.sender).catch(() => m.sender.split('@')[0]);
    const receiverName = await conn.getName(mentionedJid).catch(() => mentionedJid.split('@')[0]);

    m.react('💸');
    await conn.reply(m.chat, `❀ *${senderName}* ha transferido *${count.toLocaleString()} ${currency}* a *${receiverName}* 💎\n> Nuevo saldo: *${user.bank.toLocaleString()} ${currency}*`, m, { mentions: [mentionedJid] });
  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '⚠️ Ocurrió un error al procesar la transferencia.', m);
  }
};

handler.help = ['pay'];
handler.tags = ['rpg'];
handler.command = ['pay', 'coinsgive', 'givecoins'];
handler.group = true;

export default handler;
