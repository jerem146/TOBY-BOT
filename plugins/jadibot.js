import { readdirSync, statSync, unlinkSync, existsSync, readFileSync, watch, rmSync, promises as fsPromises } from "fs";
import path, { join } from 'path';
import ws from 'ws';

const fs = { ...fsPromises, existsSync };

let handler = async (m, { conn, command, usedPrefix, args, text, isOwner }) => {
  try {
    const isCommand1 = /^(deletesesion|deletebot|deletesession|deletesesaion)$/i.test(command);
    const isCommand2 = /^(stop|pausarai|pausarbot)$/i.test(command);
    const isCommand3 = /^(bots|sockets|socket)$/i.test(command);

    const emoji = '🧠';
    const emoji2 = '🚫';
    const emoji3 = '✅';
    const botname = 'Bot';
    const jadi = 'jadibots'; // Asegúrate de que esta carpeta exista
    const msm = '⚠️';

    if (!command) return m.reply(`${msm} Comando no detectado.`);

    if (isCommand1) {
      const who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender);
      const uniqid = `${who.split`@`[0]}`;
      const sessionPath = `./${jadi}/${uniqid}`;

      if (!fs.existsSync(sessionPath)) {
        await conn.sendMessage(m.chat, {
          text: `${emoji} Usted no tiene una sesión. Puede crear una usando:\n${usedPrefix + command}\n\nSi tiene una ID puede saltarse este paso:\n${usedPrefix + command} (ID)`,
        }, { quoted: m });
        return;
      }

      if (global.conn.user.jid !== conn.user.jid) {
        await conn.sendMessage(m.chat, {
          text: `${emoji2} Use este comando en el *bot principal*:\nhttps://wa.me/${global.conn.user.jid.split`@`[0]}?text=${usedPrefix + command}`,
        }, { quoted: m });
        return;
      }

      await conn.sendMessage(m.chat, { text: `${emoji} Tu sesión como *Sub-Bot* se ha eliminado` }, { quoted: m });

      try {
        await fs.rm(sessionPath, { recursive: true, force: true });
        await conn.sendMessage(m.chat, { text: `${emoji3} Se ha cerrado la sesión y borrado todo rastro.` }, { quoted: m });
      } catch (e) {
        console.error("❌ Error al eliminar carpeta:", e);
        await conn.sendMessage(m.chat, { text: `${msm} Error al eliminar la carpeta.` }, { quoted: m });
      }
    }

    // Caso: Pausar bot
    else if (isCommand2) {
      if (global.conn.user.jid === conn.user.jid) {
        await conn.sendMessage(m.chat, { text: `${emoji2} No puedes pausar el *bot principal*.`, quoted: m });
        return;
      }

      await conn.sendMessage(m.chat, { text: `${emoji} ${botname} desactivado.`, quoted: m });
      conn.ws.close();
    }

    // Caso: Mostrar sub-bots activos
    else if (isCommand3) {
      const users = [...new Set([...global.conns.filter(c => c?.user && c.ws?.socket?.readyState !== ws.CLOSED)])];

      const convertirMsADiasHorasMinutosSegundos = (ms) => {
        let s = Math.floor(ms / 1000) % 60,
            m = Math.floor(ms / (1000 * 60)) % 60,
            h = Math.floor(ms / (1000 * 60 * 60)) % 24,
            d = Math.floor(ms / (1000 * 60 * 60 * 24));
        return `${d}d ${h}h ${m}m ${s}s`;
      };

      const message = users.map((v, i) => 
        `• 「 ${i + 1} 」\n📎 https://wa.me/${v.user.jid.replace(/[^0-9]/g, '')}?text=${usedPrefix}estado\n👤 Usuario: ${v.user.name || 'Sub-Bot'}\n🕑 Online: ${v.uptime ? convertirMsADiasHorasMinutosSegundos(Date.now() - v.uptime) : 'Desconocido'}`
      ).join('\n\n__________________________\n\n');

      const responseMessage = message.length === 0
        ? `${emoji2} No hay *sub-bots* activos ahora mismo.`
        : `${emoji} 𝐋𝐈𝐒𝐓𝐀 𝐃𝐄 𝐋𝐎𝐒 𝐒𝐔𝐁𝐁𝐎𝐓𝐒n\n\n\    n\╭━━━━━━━━━━━━━n\> SI QUIERES UNIR A UNO DE ELLOS A TU GRUPO, ESCRIBELE AL PRIVADO Y DILES QUE SE UNAN COMO BOT.
╰━━━━━━━━━━━━━n\n\Subbots conectados:\n\n${message}`;

      await conn.sendMessage(m.chat, {
        text: responseMessage,
        mentions: conn.parseMention(responseMessage),
      }, { quoted: m });
    }

    else {
      await m.reply(`${msm} Comando no reconocido.`);
    }

  } catch (err) {
    console.error("❌ Error general en handler:", err);
    await m.reply('🚨 Ocurrió un error al ejecutar el comando. Revisa la consola.');
  }
};

handler.tags = ['serbot'];
handler.help = ['sockets', 'deletesesion', 'pausarai'];
handler.command = /^(deletesesion|deletebot|deletesession|deletesesaion|stop|pausarai|pausarbot|bots|sockets|socket)$/i;

export default handler;
