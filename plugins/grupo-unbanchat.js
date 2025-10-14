let handler = async (m, { conn, isROwner }) => {

    let chat = global.db.data.chats[m.chat];
    if (!chat || !chat.bannedBots) {
        return m.reply('Este bot no está baneado en este chat.');
    }

    const botJid = conn.user.jid;

    if (!chat.bannedBots.includes(botJid)) {
        return m.reply('Este bot no está baneado en este chat.');
    }

    chat.bannedBots = chat.bannedBots.filter(jid => jid !== botJid);

    m.reply(`✅ *Bot Desbaneado*\n\nEste bot (${conn.user.name || 'este bot'}) volverá a responder a los comandos en este chat a partir de ahora.`);
};

handler.help = ['unbanchat'];
handler.tags = ['owner'];
handler.command = ['unbanchat', 'desbanearchat'];
handler.group = true;
handler.rowner = true;

export default handler;