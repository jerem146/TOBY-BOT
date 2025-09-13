import { smsg } from './lib/simple.js';
import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';
import ws from 'ws';
import failureHandler from './lib/respuesta.js';

const { proto } = (await import('@whiskeysockets/baileys')).default;
const isNumber = x => typeof x === 'number' && !isNaN(x);

const DEFAULT_USER = {
    exp: 0, coin: 10, joincount: 1, diamond: 3, lastadventure: 0, health: 100,
    lastclaim: 0, lastcofre: 0, lastdiamantes: 0, lastcode: 0, lastduel: 0,
    lastpago: 0, lastmining: 0, lastcodereg: 0, crime: 0, muto: false,
    registered: false, genre: '', birth: '', marry: '', description: '',
    packstickers: null, name: '', age: -1, regTime: -1, afk: -1, afkReason: '',
    banned: false, useDocument: false, bank: 0, level: 0, role: 'Nuv',
    premium: false, premiumTime: 0, warn: 0,
};

const DEFAULT_CHAT = {
    isBanned: false, sAutoresponder: '', welcome: true, welcomeText: null,
    byeText: null, autolevelup: false, autoAceptar: false, autosticker: false,
    autoRechazar: false, autoresponder: false, detect: true, antiBot: false,
    antiBot2: false, modoadmin: false, antiLink: true, antiImg: false,
    reaction: false, antiArabe: false, nsfw: false, antifake: false,
    delete: false, expired: 0, botPrimario: null,
};

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || [];
    if (!chatUpdate) return;
    
    this.pushMessage(chatUpdate.messages).catch(console.error);
    let m = chatUpdate.messages[chatUpdate.messages.length - 1];
    if (!m) return;

    if (global.db.data == null) await global.loadDatabase();

    try {
        m = smsg(this, m) || m;
        if (!m) return;

        const chatDB = global.db.data.chats[m.chat];
        if (chatDB?.botPrimario && chatDB.botPrimario !== this.user.jid) {
            const universalWords = ['resetbot', 'resetprimario', 'botreset'];
            const firstWord = m.text?.trim().split(' ')[0].toLowerCase() || '';
            if (!universalWords.includes(firstWord)) {
                return;
            }
        }
        
        m.exp = 0;
        m.coin = false;
        
        try {
            let user = global.db.data.users[m.sender] || {};
            let chat = global.db.data.chats[m.chat] || {};
            let settings = global.db.data.settings[this.user.jid] || {};

            if (user) {
                global.db.data.users[m.sender] = { ...DEFAULT_USER, name: m.name, ...user };
            }
            if (chat) {
                global.db.data.chats[m.chat] = { ...DEFAULT_CHAT, ...chat };
            }
            if (settings) {
                global.db.data.settings[this.user.jid] = {
                    self: false, restrict: true, jadibotmd: true, antiPrivate: false, autoread: false, status: 0,
                    ...settings
                };
            }
        } catch (e) {
            console.error("Error al inicializar la base de datos:", e);
        }

        if (opts['nyimak']) return;
        if (!m.fromMe && opts['self']) return;
        if (opts['swonly'] && m.chat !== 'status@broadcast') return;
        if (typeof m.text !== 'string') m.text = '';

        const _user = global.db.data.users[m.sender];
        const groupMetadata = (m.isGroup ? ((this.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {};
        const participants = (m.isGroup ? groupMetadata.participants : []) || [];
        
        const cleanJid = jid => jid?.split(':')[0] || '';
        const normalizeJid = jid => jid?.replace(/[^0-9]/g, '');
        
        const senderNum = normalizeJid(m.sender);
        const botNums = [this.user.jid, this.user.lid].map(j => normalizeJid(cleanJid(j)));
        
        const user = m.isGroup ? participants.find(u => normalizeJid(u.id) === senderNum) : {};
        const bot = m.isGroup ? participants.find(u => botNums.includes(normalizeJid(u.id))) : {};
        
        const isRAdmin = user?.admin === 'superadmin' || false;
        const isAdmin = isRAdmin || user?.admin === 'admin' || false;
        const isBotAdmin = !!bot?.admin;

        const myJid = this.user?.id ? this.decodeJid(this.user.id) : '';
        const isROwner = [myJid, ...global.owner.map(([number]) => number)].filter(Boolean).map(v => v.replace(/[^0-9]/g, '')).includes(senderNum);
        const isOwner = isROwner || m.fromMe;
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum);
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum) || _user?.premium;

        if (m.isBaileys) return;
        m.exp += Math.ceil(Math.random() * 10);

        let usedPrefix;
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');

        for (let name in global.plugins) {
            let plugin = global.plugins[name];
            if (!plugin || plugin.disabled) continue;

            const __filename = join(___dirname, name);
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname, __filename });
                } catch (e) {
                    console.error(`Error en plugin.all (${name}):`, e);
                }
            }

            if (!opts['restrict'] && plugin.tags?.includes('admin')) continue;
            
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
            let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix;
            let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => [new RegExp(str2Regex(p)).exec(m.text), new RegExp(str2Regex(p))]) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] : [[[], new RegExp]]
            ).find(p => p[1] && p[0]);

            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, { match, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname, __filename }))
                continue;
            }
            if (typeof plugin !== 'function') continue;

            if ((usedPrefix = (match?.[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '');
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v);
                args = args || [];
                let text = noPrefix.trim().split` `.slice(1).join` `;
                command = (command || '').toLowerCase();
                
                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false;
                
                if (!isAccept) continue;
                
                m.plugin = name;
                
                const chat = global.db.data.chats[m.chat];
                const user = global.db.data.users[m.sender];
                
                if (chat?.isBanned && !isROwner && !['grupo-unbanchat.js'].includes(name)) return;
                if (user?.banned && !isROwner && !['owner-unbanuser.js'].includes(name)) {
                    return m.reply(`🚫 Estás baneado y no puedes usar comandos.`);
                }
                
                let adminMode = chat?.modoadmin;
                if (adminMode && !isAdmin && !isOwner && m.isGroup) return;

                const fail = plugin.fail || global.dfail;
                if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue; }
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue; }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue; }
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue; }
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue; }
                if (plugin.private && m.isGroup) { fail('private', m, this); continue; }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue; }
                if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue; }
                if (plugin.unreg && !user?.registered) { fail('unreg', m, this); continue; }
                if (plugin.register && !user?.registered) { fail('unreg', m, this); continue; }

                m.isCommand = true;
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17;
                m.exp += xp;

                if (!isPrems && plugin.coin && user.coin < plugin.coin) {
                    return this.reply(m.chat, `❮✦❯ Se agotaron tus ${global.moneda || 'monedas'}`, m);
                }

                if (plugin.level > user.level) {
                    return this.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n• Tu nivel actual es: *${user.level}*`, m);
                }

                let extra = { match, usedPrefix, noPrefix, args, command, text, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname, __filename };

                try {
                    await plugin.call(this, m, extra);
                    if (!isPrems) m.coin = m.coin || plugin.coin || false;
                
                } catch (e) {
                    m.error = e;
                    console.error(`Error en el plugin '${name}':`, e);
                    
                    if (e) {
                        let text = format(e);
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '*******');
                        
                        console.error(text);
                        await this.reply(m.chat, `😥 Ocurrió un error al ejecutar el comando.`, m);
                    }

                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra);
                        } catch (e) {
                            console.error(`Error en plugin.after (${name}):`, e);
                        }
                    }
                    if (m.coin) {
                        const consumed = +m.coin;
                        user.coin -= consumed;
                        this.reply(m.chat, `❮✦❯ Utilizaste ${consumed} ${global.moneda || 'monedas'}`, m);
                    }
                }
                break;
            }
        }
    } catch (e) {
        console.error("Error crítico en el handler:", e);
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id);
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1);
        }

        let user;
        if (m && (user = global.db.data.users[m.sender])) {
            user.exp += m.exp;
        }

        let stats = global.db.data.stats;
        if (m && m.plugin) {
            let now = +new Date;
            if (m.plugin in stats) {
                let stat = stats[m.plugin];
                stat.total = (stat.total || 0) + 1;
                stat.last = now;
                if (m.error == null) {
                    stat.success = (stat.success || 0) + 1;
                    stat.lastSuccess = now;
                }
            } else {
                stats[m.plugin] = {
                    total: 1,
                    success: m.error == null ? 1 : 0,
                    last: now,
                    lastSuccess: m.error == null ? now : 0
                };
            }
        }
        
        try {
            if (!opts['noprint']) await (await import('./lib/print.js')).default(m, this);
        } catch (e) {
            console.log(m, m.quoted, e);
        }
        
        if (opts['autoread']) await this.readMessages([m.key]);
        
        if (global.db.data.chats[m.chat]?.reaction && m.text.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi)) {
            if (!m.fromMe) {
                 const emojis = ["❤️", "👍", "😂", "😮", "😢", "😠", "✨", "🎉", "🔥", "💯", "✅", " Bv "];
                 const emot = emojis[Math.floor(Math.random() * emojis.length)];
                 this.sendMessage(m.chat, { react: { text: emot, key: m.key }});
            }
        }
    }
}

global.dfail = (type, m, conn) => { failureHandler(type, conn, m); };

const file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
    unwatchFile(file);
    console.log(chalk.green('✅ Actualizando "handler.js"...'));
    if (global.conns?.length > 0) {
        const users = [...new Set(global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED))];
        for (const user of users) {
            try {
                await user.reloadHandler(false);
            } catch (e) {
                console.error(`Error al recargar handler para ${user.user?.name}:`, e);
            }
        }
    }
});