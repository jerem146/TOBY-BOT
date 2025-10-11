const handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};

  const avatar = "https://files.catbox.moe/1k2k6p.jpg";

  const text = `✨ *CONFIGURACIÓN DEL GRUPO* ◈ Welcome: \`${chat.welcome ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Activa o desactiva el mensaje de bienvenida en el grupo.

◈ Autolevelup: \`${chat.autolevelup ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Activa o descativa la subida automática de nivel en el Bot.

◈ Antibot: \`${chat.antiBot ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Expulsa a otros bots no autorizados.

◈ Antisubbots: \`${chat.antiBot2 ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Expulsa a subbots no autorizados.

◈ Autoaceptar: \`${chat.autoAceptar ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Acepta automáticamente números al grupo.

◈ Autorechazar: \`${chat.autoRechazar ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Rechaza automáticamente números al grupo.

◈ Autoresponder: \`${chat.autoresponder ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Responde automáticamente con IA.

◈ Modoadmin: \`${chat.modoadmin ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Solo responde a admins.

◈ Reaction: \`${chat.reaction ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Activa las reacciones del bot.

◈ NSFW: \`${chat.nsfw ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Activa comandos +18.

◈ Detect: \`${chat.detect ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Detecta cambios en el grupo.

◈ Antilink: \`${chat.antiLink ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Bloquea links de WhatsApp.

◈ Antilink2: \`${chat.antiLink2 ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Bloquea enlaces HTTPS.

◈ Antitoxic: \`${chat.antitoxic ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Elimina mensajes ofensivos.

◈ Antitraba: \`${chat.antiTraba ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Evita mensajes traba (muchos caracteres).

◈ Antifake: \`${chat.antifake ? 'Activado' : 'Desactivado'}\`
> ➨ *Descripción:* Bloquea números falsos.

_*✦ Nota: Puedes activar una opción así: Ejemplo: #antilink*_`.trim();

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      externalAdReply: {
        title: global.packname,
        body: global.dev, 
        thumbnailUrl: avatar,
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
};

handler.help = ['configuraciongrupo'];
handler.tags = ['grupo'];
handler.command = ['config', 'opciones', 'nable'];
handler.register = true;
handler.group = true;

export default handler;