const handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};
  const metadata = await conn.groupMetadata(m.chat).catch(_ => null) || {};
  const groupName = metadata.subject || 'este Grupo';

  const status = (option) => option ? '✅' : '❌';

  const primaryBot = chat.botPrimario ? `@${chat.botPrimario.split('@')[0]}` : 'Sin establecer';

  const avatar = "https://files.catbox.moe/1k2k6p.jpg";

  const text = `╭━━━[ *CONFIGURACIÓN* ]━━━⬣
┃
┃ ✨ Grupo: *${groupName}*
┃ 🤖 Bot Primario: *${primaryBot}*
┃
┠───═[ *SEGURIDAD* ]═───⬣
┃
┃ ${status(chat.antiLink)} ◈ Antienlaces (WhatsApp)
┃ ${status(chat.antiLink2)} ◈ Antienlaces (Externos)
┃ ${status(chat.antiBot)} ◈ Antibots
┃ ${status(chat.antiBot2)} ◈ Antisubbots
┃ ${status(chat.antitoxic)} ◈ Antitóxicos
┃ ${status(chat.antitraba)} ◈ Antitraba
┃ ${status(chat.antifake)} ◈ Antifakes
┃
┠───═[ *AUTOMATIZACIÓN* ]═───⬣
┃
┃ ${status(chat.welcome)} ◈ Bienvenida
┃ ${status(chat.detect)} ◈ Detectar cambios
┃ ${status(chat.autolevelup)} ◈ Subir de nivel auto
┃ ${status(chat.autoresponder)} ◈ Responder con IA
┃ ${status(chat.reaction)} ◈ Reacciones automáticas
┃
┠───═[ *GESTIÓN Y CONTENIDO* ]═───⬣
┃
┃ ${status(chat.modoadmin)} ◈ Modo solo admins
┃ ${status(chat.autoAceptar)} ◈ Aceptar usuarios auto
┃ ${status(chat.autoRechazar)} ◈ Rechazar usuarios auto
┃ ${status(chat.nsfw)} ◈ Comandos +18
┃
╰━━━━━━━━━━━━━━━━━━⬣

> *Activa o desactiva una opción con, por ejemplo: #antilink*`.trim();

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      mentionedJid: [chat.botPrimario],
      externalAdReply: {
        title: `❖ ${groupName} ❖`,
        body: '(◍•ᴗ•◍) 𝙲𝙾𝙽𝙵𝙸𝙶𝚄𝚁𝙰𝙲𝙸𝙾́𝙽 𝙳𝙴𝙻 𝙶𝚁𝚄𝙿𝙾',
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