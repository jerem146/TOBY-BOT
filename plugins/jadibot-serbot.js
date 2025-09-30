/*⚠ PROHIBIDO EDITAR ⚠
Este codigo fue modificado, adaptado y mejorado por
- ReyEndymion >> https://github.com/ReyEndymion
El codigo de este archivo esta inspirado en el codigo original de:
- Aiden_NotLogic >> https://github.com/ferhacks
*El archivo original del MysticBot-MD fue liberado en mayo del 2024 aceptando su liberacion*
El codigo de este archivo fue parchado en su momento por:
- BrunoSobrino >> https://github.com/BrunoSobrino
Contenido adaptado por:
- GataNina-Li >> https://github.com/GataNina-Li
- elrebelde21 >> https://github.com/elrebelde21
*/

import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys";
import qrcode from "qrcode";
import NodeCache from "node-cache";
import fs from "fs";
import path from "path";
import pino from 'pino';
import chalk from 'chalk';
import { exec } from 'child_process';
import * as ws from 'ws';
import { makeWASocket } from '../lib/simple.js';
import { fileURLToPath } from 'url';

// --- NUEVAS VARIABLES DE TEXTO ---
const mssg = {
  botinfo: `𝚄𝚂𝙰 𝙴𝚂𝚃𝙴 𝙲𝙾𝙳𝙸𝙶𝙾 𝙿𝙰𝚁𝙰 𝚂𝙴𝚁 𝚂𝚄𝙱 𝙱𝙾𝚃.\n\n` +
    "> `𝙶𝚄𝙸𝙰:` \n" +
    "> `1` : 𝙷𝚊𝚐𝚊 𝚌𝚕𝚒𝚌𝚔 𝚎𝚗 𝚕𝚘𝚜 𝟹 𝚙𝚞𝚗𝚝𝚘𝚜\n" +
    "> `2` : 𝚃𝚘𝚚𝚞𝚎 𝚍𝚒𝚜𝚙𝚘𝚜𝚒𝚝𝚒𝚟𝚘𝚜 𝚟𝚒𝚗𝚌𝚞𝚕𝚊𝚍𝚘𝚜\n" +
    "> `3` : 𝚂𝚎𝚕𝚎𝚌𝚌𝚒𝚘𝚗𝚊 𝚅𝚒𝚗𝚌𝚞𝚕𝚊𝚛 𝚌𝚘𝚗 𝚎𝚕 𝚗ú𝚖𝚎𝚛𝚘 𝚍𝚎 𝚝𝚎𝚕é𝚏𝚘𝚗𝚘\n" +
    "> `4` : 𝙴𝚜𝚌𝚛𝚒𝚋𝚊 𝚎𝚕 𝙲𝚘𝚍𝚒𝚐𝚘\n\n" +
    "`Nota :` 𝙴𝚜𝚝𝚎 𝙲ó𝚍𝚒𝚐𝚘 𝚜𝚘𝚕𝚘 𝚏𝚞𝚗𝚌𝚒𝚘𝚗𝚊 𝚎𝚗 𝚎𝚕 𝚗ú𝚖𝚎𝚛𝚘 𝚚𝚞𝚎 𝚕𝚘 𝚜𝚘𝚕𝚒𝚌𝚒𝚝𝚘",
  rembot: "`𝚁𝚄𝙱𝚈 𝙷𝙾𝚂𝙷𝙸𝙽𝙾 - 𝙹𝙰𝙳𝙸𝙱𝙾𝚃`", // Footer personalizado
};

// --- CÓDIGO EXISTENTE ---
let crm1 = "Y2QgcGx1Z2lucy";
let crm2 = "A7IG1kNXN1b";
let crm3 = "SBpbmZvLWRvbmFyLmpz";
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz";
let drm1 = "";
let drm2 = "";
let rtx = "*\n\n✐ Cσɳҽxισɳ SυႦ-Bσƚ Mσԃҽ QR\n\n✰ Con otro celular o en la PC escanea este QR para convertirte en un *Sub-Bot* Temporal.\n\n`1` » Haga clic en los tres puntos en la esquina superior derecha\n\n`2` » Toque dispositivos vinculados\n\n`3` » Escanee este codigo QR para iniciar sesion con el bot\n\n✧ ¡Este código QR expira en 45 segundos!.";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RubyJBOptions = {};
if (global.conns instanceof Array) console.log();
else global.conns = [];

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
    let time = global.db.data.users[m.sender].Subs + 120000;
    if (new Date - global.db.data.users[m.sender].Subs < 120000) return conn.reply(m.chat, ` Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m);
    
    const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
    if (subBots.length === 90) {
        return m.reply(` No se han encontrado espacios para *Sub-Bots* disponibles.`);
    }

    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let id = `${who.split`@`[0]}`;
    let pathRubyJadiBot = path.join(`./jadibts/`, id); // Recomiendo usar un nombre de carpeta claro como 'jadibts'
    if (!fs.existsSync(pathRubyJadiBot)) {
        fs.mkdirSync(pathRubyJadiBot, { recursive: true });
    }

    RubyJBOptions.pathRubyJadiBot = pathRubyJadiBot;
    RubyJBOptions.m = m;
    RubyJBOptions.conn = conn;
    RubyJBOptions.args = args;
    RubyJBOptions.usedPrefix = usedPrefix;
    RubyJBOptions.command = command;
    RubyJBOptions.fromCommand = true;
    RubyJadiBot(RubyJBOptions);
    global.db.data.users[m.sender].Subs = new Date * 1;
};
handler.help = ['qr', 'code'];
handler.tags = ['serbot'];
handler.command = ['qr', 'code'];
export default handler;

export async function RubyJadiBot(options) {
    let { pathRubyJadiBot, m, conn, args, usedPrefix, command } = options;
    if (command === 'code') {
        command = 'qr';
        args.unshift('code');
    }
    const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false;

    const { state, saveCreds } = await useMultiFileAuthState(pathRubyJadiBot);
    const msgRetryCache = new NodeCache();
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        logger: pino({ level: "silent" }),
        printQRInTerminal: false,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
        msgRetryCounterCache: msgRetryCache,
        browser: ['Ubuntu', 'Chrome', '20.0.04', 'Ruby-Hoshino-Bot'],
        version,
        generateHighQualityLinkPreview: true
    };

    let sock = makeWASocket(connectionOptions);

    async function connectionUpdate(update) {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !mcode) {
            let txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim() }, { quoted: m });
            setTimeout(() => { conn.sendMessage(m.chat, { delete: txtQR.key }) }, 45000);
        }

        // --- BLOQUE MODIFICADO ---
        if (qr && mcode) {
            const parent = conn; // El bot principal que enviará el mensaje
            const cleanedNumber = m.sender.split('@')[0];
            
            // Usamos un setTimeout para dar tiempo a la conexión de establecerse un poco
            setTimeout(async () => {
                try {
                    let codeBot = await sock.requestPairingCode(cleanedNumber);
                    codeBot = codeBot?.match(/.{1,4}/g)?.join("-") || codeBot;
                    const imageUrl = "https://i.ibb.co/0cdWZb5/105d0d0c0f05348828ee14fae199297c.jpg";

                    // Creamos el mensaje con botones usando la sintaxis de Baileys
                    let buttonMessage = {
                        image: { url: imageUrl },
                        caption: `‹𝟹 𝙲𝙾𝙳𝙴: *${codeBot}*\n\n${mssg.botinfo}`,
                        footer: mssg.rembot,
                        templateButtons: [
                            { index: 1, quickReplyButton: { displayText: 'Copiar Código', id: `.copiar ${codeBot}` } }
                        ]
                    };

                    await parent.sendMessage(m.chat, buttonMessage, { quoted: m });
                } catch (e) {
                    console.error("Error al solicitar el código de emparejamiento:", e);
                    await parent.reply(m.chat, "Hubo un error al generar tu código. Por favor, intenta de nuevo.", m);
                }
            }, 3000);
        }
        // --- FIN DEL BLOQUE MODIFICADO ---

        if (connection === 'open') {
            console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 (+${sock.user.id.split(':')[0]}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`));
            global.conns.push(sock);
            await m.reply(`¡Conectado exitosamente! Ya eres un Sub-Bot.`);
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            console.log(chalk.bold.magentaBright(`Conexión cerrada, razón: ${reason}`));
            let i = global.conns.indexOf(sock);
            if (i >= 0) {
                delete global.conns[i];
                global.conns.splice(i, 1);
            }
            if (reason === DisconnectReason.loggedOut) {
                await m.reply("La sesión del Sub-Bot ha sido cerrada. Deberás conectarte de nuevo.");
                fs.rmdir(pathRubyJadiBot, { recursive: true }, (err) => {
                    if (err) console.error(`Error al eliminar la carpeta de sesión: ${err}`);
                });
            }
        }
    }

    sock.ev.on("connection.update", connectionUpdate);
    sock.ev.on("creds.update", saveCreds);
}

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60);
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    return minutes + " m y " + seconds + " s ";
}