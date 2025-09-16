import { normalizeJid } from './shouldBotRespond.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {});

    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        const reset = text?.toLowerCase() === 'reset' || text?.toLowerCase() === 'resetbot' || text?.toLowerCase() === 'restablecer';
        if (reset) {
            if (!chat.botPrimario) return m.reply('《✧》 No hay ningún bot primario establecido en este grupo.');
            chat.botPrimario = null;
            if (global.db?.write) await global.db.write();
            return m.reply('✐ Se ha restablecido la configuración. Ahora todos los bots responderán nuevamente en este grupo.');
        }
        return m.reply(`《✧》 Debes mencionar a un usuario (bot o persona) para establecerlo como primario.\nEj: ${usedPrefix + command} @tag`);
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
