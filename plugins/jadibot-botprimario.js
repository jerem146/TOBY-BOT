let handler = async (m, { conn, text, usedPrefix, command }) => {
    const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});

    const resetWords = ['reset', 'resetbot', 'resetprimario', 'botreset'];
    const firstWord = (text || '').trim().split(/\s+/)[0]?.replace(/^[^a-z0-9]+/i, '').toLowerCase();

    if (resetWords.includes(firstWord)) {
        if (!chat.botPrimario) return m.reply('《✧》 No hay ningún bot primario en este grupo.');
        chat.botPrimario = null;
        if (global.db?.write) await global.db.write();
        return m.reply('✐ Se restableció la configuración. Ahora todos los bots responderán nuevamente en este grupo.');
    }

    if (chat.botPrimario) {
        const normalizeJid = jid => jid?.toLowerCase().replace(/:\d+@/, '@');
        const connJid = normalizeJid(conn?.user?.id || conn?.user?.jid);
        const primaryJid = normalizeJid(chat.botPrimario);

        if (primaryJid && connJid !== primaryJid) {
            return;
        }
    }

    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return m.reply(`《✧》 Debes mencionar a un usuario/bot para establecerlo como primario.\nEj: ${usedPrefix + command} @tag`);
    }

    const raw = m.mentionedJid[0];
    const normalized = raw.toLowerCase().replace(/:\d+@/, '@');

    chat.botPrimario = normalized;
    if (global.db?.write) await global.db.write();

    await conn.sendMessage(m.chat, {
        text: `✐ Se estableció como primario a *@${normalized.split('@')[0]}*`,
        mentions: [normalized]
    }, { quoted: m });
};

handler.help = ['setprimary @user', 'resetbot'];
handler.tags = ['grupo'];
handler.command = ['setprimary', 'botprimario', 'setbot'];
handler.group = true;
handler.admin = true;

export default handler;
