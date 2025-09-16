import { normalizeJid } from '../utils.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});

    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        const reset = ['reset', 'resetbot', 'resetprimario', 'botreset'].includes(text?.toLowerCase());
        if (reset) {
            if (!chat.botPrimario) return m.reply('《✧》 No hay ningún bot primario establecido en este grupo.');
            chat.botPrimario = null;
            if (global.db?.write) await global.db.write();
            return m.reply('✐ Configuración restablecida. Ahora todos los bots responderán en este grupo.');
        }
        return m.reply(`《✧》 Debes mencionar a un usuario para establecerlo como primario.\n\nEjemplo: ${usedPrefix + command} @usuario`);
    }

    const raw = m.mentionedJid[0];
    const normalized = normalizeJid(raw);
    chat.botPrimario = normalized;
    if (global.db?.write) await global.db.write();

    await conn.sendMessage(m.chat, {
        text: `✐ Se estableció como primario a *@${normalized.split('@')[0]}*`,
        mentions: [normalized]
    }, { quoted: m });
};

handler.help = ['setprimary @user'];
handler.tags = ['grupo'];
handler.command = ['setprimary', 'botprimario', 'setbot'];
handler.group = true;
handler.admin = true;

export default handler;
