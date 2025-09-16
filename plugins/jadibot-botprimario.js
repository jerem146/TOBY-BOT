let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat];

    // resetear bot primario
    if (m.mentionedJid.length === 0) {
        let reset = text?.toLowerCase() === 'reset' || text?.toLowerCase() === 'restablecer' || text?.toLowerCase() === 'resetbot';
        if (reset) {
            if (!chat.botPrimario) return m.reply('《✧》 No hay ningún bot primario establecido en este grupo.');

            chat.botPrimario = null;
            await m.reply(`✐ Se ha restablecido la configuración. Ahora todos los bots responderán nuevamente en este grupo.`);
            return;
        }

        return m.reply(`《✧》 Debes mencionar a un bot del grupo para establecerlo como primario.\n\n> *Ejemplo:* ${usedPrefix + command} @tagdelbot\n\n> ❀ También puedes usar *resetbot* (SIN PREFIJOS) para que todos los bots vuelvan a responder.`);
    }

    let botJid = m.mentionedJid[0];

    // obtener lista de conexiones disponibles
    const users = global.conns && Array.isArray(global.conns) ? global.conns : [];

    let selectedBot;

    // si es este mismo bot
    if (botJid === conn.user.id || botJid === conn.user.jid) {
        selectedBot = conn;
    } else {
        // buscar entre los clones disponibles
        selectedBot = users.find(sub => 
            sub?.user?.id === botJid || sub?.user?.jid === botJid
        );
    }

    if (!selectedBot) {
        return conn.reply(m.chat, `✧ El usuario mencionado no es un bot conectado actualmente.`, m);
    }

    if (chat.botPrimario === botJid) {
        return conn.reply(m.chat, `✧ @${botJid.split('@')[0]} ya es el bot primario.`, m, { mentions: [botJid] });
    }

    chat.botPrimario = botJid;

    let botName = await conn.getName(botJid);
    let response = `✐ Se ha establecido a *@${botJid.split('@')[0]}* como bot primario de este grupo.
> A partir de ahora, todos los comandos del grupo serán ejecutados por *@${botJid.split('@')[0]}*.

> *Nota:* Si sucede algún inconveniente, puedes restablecer la configuración usando el comando \`resetbot\` (sin prefijo).`;

    await conn.sendMessage(m.chat, { 
        text: response, 
        mentions: [botJid] 
    }, { quoted: m });
}

handler.help = ['setbotprimario @bot', 'setbot @bot'];
handler.tags = ['grupo'];
handler.command = ['setprimary', 'botprimario', 'setprimarybot', 'setbot'];
handler.group = true;
handler.admin = true;

export default handler;
