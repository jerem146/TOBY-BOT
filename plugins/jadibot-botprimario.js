let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat];

    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        let reset = text?.toLowerCase() === 'reset' || text?.toLowerCase() === 'restablecer' || text?.toLowerCase() === 'resetbot';
        if (reset) {
            if (!chat.botPrimario) return m.reply('《✧》 No hay ningún bot primario establecido en este grupo.');

            chat.botPrimario = null;
            if (global.db.write) await global.db.write();
            await m.reply(`✐ Se ha restablecido la configuración. Ahora todos los bots responderán nuevamente.`);
            return;
        }

        return m.reply(`《✧》 Debes mencionar a un usuario (bot o humano) para establecerlo como primario.\n\n> *Ejemplo:* ${usedPrefix + command} @tag\n\n> ❀ También puedes usar *resetbot* (SIN PREFIJOS) para que todos los bots vuelvan a responder.`);
    }

    let botJid = m.mentionedJid[0];

    if (chat.botPrimario === botJid) {
        return conn.reply(m.chat, `✧ @${botJid.split('@')[0]} ya es el primario.`, m, { mentions: [botJid] });
    }

    chat.botPrimario = botJid;
    if (global.db.write) await global.db.write();

    let response = `✐ Se ha establecido a *@${botJid.split('@')[0]}* como primario de este grupo.
> A partir de ahora, solo *@${botJid.split('@')[0]}* responderá a los comandos aquí.

> *Nota:* Para restablecer la configuración, usa el comando \`resetbot\` (sin prefijo).`;

    await conn.sendMessage(m.chat, { text: response, mentions: [botJid] }, { quoted: m });
}

handler.help = ['setprimary @user'];
handler.tags = ['grupo'];
handler.command = ['setprimary', 'botprimario', 'setbot'];
handler.group = true;
handler.admin = true;

export default handler;
