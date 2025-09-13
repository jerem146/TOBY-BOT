import { smsg } from './lib/simple.js';
import { format } from 'util';
import * as ws from 'ws';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';
import failureHandler from './lib/respuesta.js';
import fetch from 'node-fetch';

const { proto } = (await import('@whiskeysockets/baileys')).default;
const isNumber = x => typeof x === 'number' && !isNaN(x);

export async function handler(chatUpdate) {
    if (!chatUpdate) return;

    let m = chatUpdate.messages[chatUpdate.messages.length - 1];
    if (!m) return;

    if (global.db.data == null) await global.loadDatabase();

    try {
        m = smsg(this, m) || m;
        if (!m) return;
        
        const chatDB = global.db.data.chats[m.chat];
        if (chatDB && chatDB.botPrimario) {
            const universalWords = ['resetbot', 'resetprimario', 'botreset'];
            const firstWord = m.text ? m.text.trim().split(' ')[0].toLowerCase() : '';

            if (!universalWords.includes(firstWord)) {
                if (chatDB.botPrimario !== this.user.jid) {
                    return;
                }
            }
        }

        m.exp = 0;
        m.coin = false;

        try {
            let user = global.db.data.users[m.sender];
            if (typeof user !== 'object')
                global.db.data.users[m.sender] = {};
            if (user) {
                if (!isNumber(user.exp)) user.exp = 0;
                if (!isNumber(user.coin)) user.coin = 10;
                if (!isNumber(user.joincount)) user.joincount = 1;
                if (!isNumber(user.diamond)) user.diamond = 3;
                if (!isNumber(user.lastadventure)) user.lastadventure = 0;
                if (!isNumber(user.lastclaim)) user.lastclaim = 0;
                if (!isNumber(user.health)) user.health = 100;
                if (!isNumber(user.crime)) user.crime = 0;
                if (!isNumber(user.lastcofre)) user.lastcofre = 0;
                if (!isNumber(user.lastdiamantes)) user.lastdiamantes = 0;
                if (!isNumber(user.lastpago)) user.lastpago = 0;
                if (!isNumber(user.lastcode)) user.lastcode = 0;
                if (!isNumber(user.lastcodereg)) user.lastcodereg = 0;
                if (!isNumber(user.lastduel)) user.lastduel = 0;
                if (!isNumber(user.lastmining)) user.lastmining = 0;
                if (!('muto' in user)) user.muto = false;
                if (!('premium' in user)) user.premium = false;
                if (!user.premium) user.premiumTime = 0;
                if (!('registered' in user)) user.registered = false;
                if (!('genre' in user)) user.genre = '';
                if (!('birth' in user)) user.birth = '';
                if (!('marry' in user)) user.marry = '';
                if (!('description' in user)) user.description = '';
                if (!('packstickers' in user)) user.packstickers = null;
                if (!user.registered) {
                    if (!('name' in user)) user.name = m.name;
                    if (!isNumber(user.age)) user.age = -1;
                    if (!isNumber(user.regTime)) user.regTime = -1;
                }
                if (!isNumber(user.afk)) user.afk = -1;
                if (!('afkReason' in user)) user.afkReason = '';
                if (!('role' in user)) user.role = 'Nuv';
                if (!('banned' in user)) user.banned = false;
                if (!('useDocument' in user)) user.useDocument = false;
                if (!isNumber(user.level)) user.level = 0;
                if (!isNumber(user.bank)) user.bank = 0;
                if (!isNumber(user.warn)) user.warn = 0;
            } else
                global.db.data.users[m.sender] = {
                    exp: 0, coin: 10, joincount: 1, diamond: 3, lastadventure: 0, health: 100, lastclaim: 0, lastcofre: 0, lastdiamantes: 0, lastcode: 0, lastduel: 0, lastpago: 0, lastmining: 0, lastcodereg: 0,
                    muto: false, registered: false, genre: '', birth: '', marry: '', description: '', packstickers: null, name: m.name, age: -1, regTime: -1, afk: -1, afkReason: '', banned: false, useDocument: false,
                    bank: 0, level: 0, role: 'Nuv', premium: false, premiumTime: 0, warn: 0
                };
            let chat = global.db.data.chats[m.chat];
            if (typeof chat !== 'object')
                global.db.data.chats[m.chat] = {};
            if (chat) {
                if (!('isBanned' in chat)) chat.isBanned = false;
                if (!('sAutoresponder' in chat)) chat.sAutoresponder = '';
                if (!('welcome' in chat)) chat.welcome = true;
                if (!('welcomeText' in chat)) chat.welcomeText = null;
                if (!('byeText' in chat)) chat.byeText = null;
                if (!('autolevelup' in chat)) chat.autolevelup = false;
                if (!('autoAceptar' in chat)) chat.autoAceptar = false;
                if (!('autosticker' in chat)) chat.autosticker = false;
                if (!('autoRechazar' in chat)) chat.autoRechazar = false;
                if (!('autoresponder' in chat)) chat.autoresponder = false;
                if (!('detect' in chat)) chat.detect = true;
                if (!('antiBot' in chat)) chat.antiBot = false;
                if (!('antiBot2' in chat)) chat.antiBot2 = false;
                if (!('modoadmin' in chat)) chat.modoadmin = false;
                if (!('antiLink' in chat)) chat.antiLink = true;
                if (!('antiImg' in chat)) chat.antiImg = false;
                if (!('reaction' in chat)) chat.reaction = false;
                if (!('antiArabe' in chat)) chat.antiArabe = false;
                if (!('nsfw' in chat)) chat.nsfw = false;
                if (!('antifake' in chat)) chat.antifake = false;
                if (!('delete' in chat)) chat.delete = false;
                if (!isNumber(chat.expired)) chat.expired = 0;
                if (!('botPrimario' in chat)) chat.botPrimario = null;
            } else
                global.db.data.chats[m.chat] = {
                    sAutoresponder: '', welcome: true, isBanned: false, autolevelup: false, autoresponder: false, delete: false, autoAceptar: false, autoRechazar: false, detect: true, antiBot: false,
                    antiBot2: false, modoadmin: false, antiLink: true, antifake: false, antiArabe: false, reaction: false, nsfw: false, expired: 0,
                    welcomeText: null, byeText: null, botPrimario: null
                };
            var settings = global.db.data.settings[this.user.jid];
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {};
            if (settings) {
                if (!('self' in settings)) settings.self = false;
                if (!('restrict' in settings)) settings.restrict = true;
                if (!('jadibotmd' in settings)) settings.jadibotmd = true;
                if (!('antiPrivate' in settings)) settings.antiPrivate = false;
                if (!('autoread' in settings)) settings.autoread = false;
            } else global.db.data.settings[this.user.jid] = {
                self: false, restrict: true, jadibotmd: true, antiPrivate: false, autoread: false, status: 0
            };
        } catch (e) {
            console.error(e);
        }
        
        if (opts['nyimak']) return;
        if (!m.fromMe && opts['self']) return;
        if (opts['swonly'] && m.chat !== 'status@broadcast') return;
        if (typeof m.text !== 'string') m.text = '';

        const _user = global.db.data.users[m.sender];
        const groupMetadata = (m.isGroup ? ((this.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {};
        const participants = (m.isGroup ? groupMetadata.participants : []) || [];
        const user = m.isGroup ? participants.find(u => u.id === m.sender) : {};
        const bot = m.isGroup ? participants.find(u => u.id === this.user.jid) : {};
        const isRAdmin = user?.admin === 'superadmin' || false;
        const isAdmin = isRAdmin || user?.admin === 'admin' || false;
        const isBotAdmin = bot?.admin || false;
        
        const myJid = this.user?.id ? this.decodeJid(this.user.id) : '';
        const isROwner = [myJid, ...global.owner.map(([number]) => `${number}@s.whatsapp.net`)].filter(Boolean).includes(m.sender);
        const isOwner = isROwner || m.fromMe;
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender) || _user.premium;

        if (m.isBaileys) return;

        m.exp += Math.ceil(Math.random() * 10);
        let usedPrefix;
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');

        for (const name in global.plugins) {
            const plugin = global.plugins[name];
            if (!plugin || plugin.disabled) continue;

            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename: join(___dirname, name) });
                } catch (e) { console.error(`Error en plugin.all (${name}):`, e); }
            }

            if (!opts['restrict'] && plugin.tags?.includes('admin')) continue;
            
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
            const _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix;
            const match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => {
                    const re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
                    return [re.exec(m.text), re];
                }) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] : [[[], new RegExp]]
            ).find(p => p[1]);

            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, { match, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename: join(___dirname, name) })) {
                    continue;
                }
            }

            if (typeof plugin !== 'function') continue;

            if ((usedPrefix = (match[0] || '')[0])) {
                const noPrefix = m.text.replace(usedPrefix, '');
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v);
                args = args || [];
                const _args = noPrefix.trim().split` `.slice(1);
                const text = _args.join` `;
                command = (command || '').toLowerCase();
                const fail = plugin.fail || global.dfail;

                const isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false;
                
                if (!isAccept) continue;
                
                m.plugin = name;
                
                if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m.sender]
                    if (!['grupo-unbanchat.js'].includes(name) && chat && chat.isBanned && !isROwner) return
                    if (name != 'grupo-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'grupo-delete.js' && chat?.isBanned && !isROwner) return 
                    if (m.text && user.banned && !isROwner) {
                        m.reply(`《✦》Estas baneado/a, no puedes usar comandos en este bot!`)
                        return
                    }
                }
                
                if (global.db.data.chats[m.chat]?.modoadmin && !isAdmin && !isOwner) return;
                
                if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue; }
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue; }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue; }
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue; }
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue; }
                if (plugin.private && m.isGroup) { fail('private', m.this); continue; }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue; }
                if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue; }
                if (plugin.register && !_user.registered) { fail('unreg', m, this); continue; }
                if (plugin.level > _user.level) { this.reply(m.chat, `❮✦❯ Nivel requerido: *${plugin.level}*\n• Tu nivel: *${_user.level}*`, m); continue; }

                m.isCommand = true;
                const xp = 'exp' in plugin ? parseInt(plugin.exp) : 17;
                if (xp > 200) m.reply('chirrido -_-');
                else m.exp += xp;
                
                if (!isPrems && plugin.coin && _user.coin < plugin.coin * 1) {
                    this.reply(m.chat, `❮✦❯ Se agotaron tus monedas`, m);
                    continue;
                }

                const extra = {
                    match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants,
                    groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
                    chatUpdate, __dirname: ___dirname, __filename: join(___dirname, name)
                };

                try {
                    await plugin.call(this, m, extra);
                    if (!isPrems) m.coin = m.coin || plugin.coin || false;
                } catch (e) {
                    m.error = e;
                    console.error(`Error en el plugin '${name}':`, e);
                    if (e) {
                        let text = format(e);
                        for (const key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), '#ADMIN#');
                        m.reply(text);
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra);
                        } catch (e) { console.error(`Error en plugin.after (${name}):`, e); }
                    }
                    if (m.coin) this.reply(m.chat, `❮✦❯ Usaste *${+m.coin}* monedas`, m);
                }
                break;
            }
        }
    } catch (e) {
        console.error("Error fatal en el handler:", e);
    } finally {
        if (m) {
            if (m.sender && global.db.data.users[m.sender]) {
                global.db.data.users[m.sender].exp += m.exp;
                global.db.data.users[m.sender].coin -= m.coin * 1;
            }

            let stats = global.db.data.stats;
            if (m.plugin) {
                const now = Date.now();
                if (m.plugin in stats) {
                    stats[m.plugin].total++;
                    stats[m.plugin].last = now;
                    if (!m.error) {
                        stats[m.plugin].success++;
                        stats[m.plugin].lastSuccess = now;
                    }
                } else {
                    stats[m.plugin] = { total: 1, success: m.error ? 0 : 1, last: now, lastSuccess: m.error ? 0 : now };
                }
            }
        }
        
        try {
            if (!opts['noprint']) await (await import('./lib/print.js')).default(m, this);
        } catch (e) {
            console.log(m, m.quoted, e);
        }
        
        if (global.db.data.chats[m.chat]?.reaction && m.text.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi)) {
            if (!m.fromMe) {
                 const emojis = ["❤️", "✨", "🔥", "👍", "😂", "🎉", "💯", "✅", "🤖", "⭐"];
                 const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                 this.sendMessage(m.chat, { react: { text: randomEmoji, key: m.key } });
            }
        }
    }
}

global.dfail = (type, m, conn) => { failureHandler(type, conn, m); };

const file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
    unwatchFile(file);
    console.log(chalk.green('✅ Handler actualizado: "handler.js"'));
    if (global.conns && global.conns.length > 0) {
        const users = [...new Set([...global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map(conn => conn)])];
        for (const user of users) {
            try {
                user.subreloadHandler(false);
            } catch (e) {
                console.error('Error al recargar el handler para un sub-bot:', e);
            }
        }
    }
});