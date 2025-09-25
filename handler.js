import { smsg } from './lib/simple.js';
import { format } from 'util';
import * as ws from 'ws';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';
import failureHandler from './lib/respuesta.js';
import fetch from 'node-fetch';
import print from './lib/print.js';

const { proto } = (await import('@whiskeysockets/baileys')).default;
const isNumber = x => typeof x === 'number' && !isNaN(x);
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms));

const defaultUser = {
exp: 0, coin: 10, joincount: 1, diamond: 3, lastadventure: 0,
health: 100, lastclaim: 0, lastcofre: 0, lastdiamantes: 0, lastcode: 0,
lastduel: 0, lastpago: 0, lastmining: 0, lastcodereg: 0, muto: false,
registered: false, genre: '', birth: '', marry: '', description: '',
packstickers: null, name: '', age: -1, regTime: -1, afk: -1,
afkReason: '', banned: false, useDocument: false, bank: 0, level: 0,
role: 'Nuv', premium: false, premiumTime: 0, warn: 0
};

const defaultChat = {
isBanned: false, sAutoresponder: '', welcome: true, welcomeText: null,
byeText: null, autolevelup: false, autoAceptar: false, autosticker: false,
autoRechazar: false, autoresponder: false, detect: true, antiBot: false,
antiBot2: false, modoadmin: false, antiLink: true, antiImg: false,
reaction: false, antiArabe: false, nsfw: false, antifake: false,
delete: false, expired: 0, botPrimario: null
};

const defaultSettings = {
self: false, restrict: true, jadibotmd: true,
antiPrivate: false, autoread: false, status: 0
};

const processedMessageIds = new Set();
function alreadyProcessed(id) {
if (!id) return false;
if (processedMessageIds.has(id)) return true;
processedMessageIds.add(id);
setTimeout(() => processedMessageIds.delete(id), 60 * 1000);
return false;
}

export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || [];
if (!chatUpdate) return;
this.pushMessage(chatUpdate.messages).catch(console.error);
let m = chatUpdate.messages[chatUpdate.messages.length - 1];
if (!m) return;
if (alreadyProcessed(m.key?.id)) return;
if (global.db.data == null) await global.loadDatabase();
try {
m = smsg(this, m) || m;
if (!m) return;
const chatDB = global.db.data.chats[m.chat];
if (chatDB?.botPrimario && chatDB.botPrimario !== this.user.jid) {
const universalWords = ['resetbot', 'resetprimario', 'botreset'];
const firstWord = m.text ? m.text.trim().split(' ')[0].toLowerCase() : '';
if (!universalWords.includes(firstWord)) {
return;
}
}
const sender = m.sender;
m.exp = 0;
m.coin = false;
try {
const user = global.db.data.users[sender];
if (user) {
Object.assign(user, { ...defaultUser, ...user });
} else {
global.db.data.users[sender] = { ...defaultUser, name: m.name };
}
const chat = global.db.data.chats[m.chat];
if (chat) {
Object.assign(chat, { ...defaultChat, ...chat });
} else {
global.db.data.chats[m.chat] = { ...defaultChat };
}
const settings = global.db.data.settings[this.user.jid];
if (settings) {
Object.assign(settings, { ...defaultSettings, ...settings });
} else {
global.db.data.settings[this.user.jid] = { ...defaultSettings };
}
} catch (e) {
console.error('Error inicializando DB:', e);
}
if (opts['nyimak']) return;
if (!m.fromMe && opts['self']) return;
if (opts['swonly'] && m.chat !== 'status@broadcast') return;
if (typeof m.text !== 'string') m.text = '';
const _user = global.db.data.users[sender];
const _chat = global.db.data.chats[m.chat];
const groupMetadata = (m.isGroup ? ((this.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {};
const participants = m.isGroup ? groupMetadata.participants : [];
const user = m.isGroup ? participants.find(u => u.id === sender) : {};
const bot = m.isGroup ? participants.find(u => u.id === this.user.jid) : {};
const isROwner = global.owner.map(([number]) => number).some(number => sender.startsWith(number));
const isOwner = isROwner || m.fromMe;
const isAdmin = user?.admin === 'superadmin' || user?.admin === 'admin' || false;
const isBotAdmin = bot?.admin === 'superadmin' || bot?.admin === 'admin' || false;
const isMods = isOwner || global.mods.some(mod => sender.startsWith(mod));
const isPrems = isMods || _user?.premium;
if (m.isBaileys) return;
m.exp += Math.ceil(Math.random() * 10);
let usedPrefix;
const prefixes = Array.isArray(this.prefix) ? this.prefix : [this.prefix];
const Pregex = new RegExp(`^(${prefixes.map(p => p.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')).join('|')})`);
const isCmd = Pregex.test(m.text);
const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
for (let name in global.plugins) {
let plugin = global.plugins[name];
if (!plugin || plugin.disabled) continue;
const __filename = join(___dirname, name);
if (typeof plugin.all === 'function') {
try {
await plugin.all.call(this, m, { chatUpdate, __dirname, __filename });
} catch (e) { console.error(e); }
}
if (!opts['restrict'] && plugin.tags?.includes('admin')) continue;
let [command, ...args] = [null, []];
let text = '';
let isAccept = false;
if (isCmd) {
const match = Pregex.exec(m.text);
if (match) {
usedPrefix = match[0];
let noPrefix = m.text.replace(usedPrefix, '');
let [cmd, ...rest] = noPrefix.trim().split` `.filter(v => v);
command = (cmd || '').toLowerCase();
args = rest || [];
text = rest.join` `;
isAccept = (plugin.command instanceof RegExp && plugin.command.test(command)) ||
(Array.isArray(plugin.command) && plugin.command.some(p => (p instanceof RegExp && p.test(command)) || p === command)) ||
(typeof plugin.command === 'string' && plugin.command === command);
}
}
if (typeof plugin.before === 'function') {
if (await plugin.before.call(this, m, { conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname, __filename }))
continue;
}
if (typeof plugin !== 'function' || !isAccept) continue;
m.plugin = name;
if (_chat?.isBanned && !isROwner && !['grupo-unbanchat.js', 'owner-exec.js', 'owner-exec2.js', 'grupo-delete.js'].includes(name)) return;
if (_user?.banned && !isROwner) {
if (_user.antispam > 2) return;
m.reply(`《✦》Estás baneado/a, no puedes usar comandos.\n\n${_user.bannedReason ? `✰ *Motivo:* ${_user.bannedReason}` : ''}`);
_user.antispam = (_user.antispam || 0) + 1;
return;
}
if (_chat?.modoadmin && m.isGroup && !isAdmin && !isOwner) continue;
if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue; }
if (plugin.owner && !isOwner) { fail('owner', m, this); continue; }
if (plugin.mods && !isMods) { fail('mods', m, this); continue; }
if (plugin.premium && !isPrems) { fail('premium', m, this); continue; }
if (plugin.group && !m.isGroup) { fail('group', m, this); continue; }
if (plugin.admin && !isAdmin) { fail('admin', m, this); continue; }
if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue; }
if (plugin.private && m.isGroup) { fail('private', m, this); continue; }
if (plugin.register && !_user.registered) { fail('unreg', m, this); continue; }
m.isCommand = true;
let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17;
if (xp > 200) m.reply('chirrido -_-');
else m.exp += xp;
if (!isPrems && plugin.coin && _user.coin < plugin.coin) {
this.reply(m.chat, `❮✦❯ Se agotaron tus monedas.`, m);
continue;
}
if (plugin.level > _user.level) {
this.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n• Tu nivel actual es: *${_user.level}*`, m);
continue;
}
let extra = {
usedPrefix, args, command, text, conn: this, participants, groupMetadata, user, bot,
isROwner, isOwner, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname, __filename
};
try {
await plugin.call(this, m, extra);
if (!isPrems) m.coin = m.coin || plugin.coin || false;
} catch (e) {
m.error = e;
console.error(e);
if (e) {
let text = format(e);
for (let key of Object.values(global.APIKeys))
text = text.replace(new RegExp(key, 'g'), '******');
m.reply(text);
}
} finally {
if (typeof plugin.after === 'function') {
try {
await plugin.after.call(this, m, extra);
} catch (e) { console.error(e); }
}
if (m.coin) this.reply(m.chat, `❮✦❯ Utilizaste ${+m.coin} monedas`, m);
}
break;
}
} catch (e) {
console.error(e);
} finally {
if (m) {
if (global.db.data.users[m.sender] && global.db.data.users[m.sender].muto) {
this.sendMessage(m.chat, { delete: m.key }).catch(console.error);
}
if (m.sender && global.db.data.users[m.sender]) {
global.db.data.users[m.sender].exp += m.exp;
global.db.data.users[m.sender].coin -= m.coin * 1;
}
let stats = global.db.data.stats;
if (m.plugin) {
let stat = stats[m.plugin] = (stats[m.plugin] || { total: 0, success: 0, last: 0, lastSuccess: 0 });
stat.total++;
stat.last = Date.now();
if (!m.error) {
stat.success++;
stat.lastSuccess = Date.now();
}
}
}
try {
if (!opts['noprint']) await print(m, this);
} catch (e) {
console.log(m, m.quoted, e);
}
if (opts['autoread']) await this.readMessages([m.key]);
if (global.db.data.chats[m.chat]?.reaction && !m.fromMe) {
const reactionEmojis = ["❤️", "👍", "😂", "😮", "😢", "😠", "✨", "🔥", "🎉", "💯"];
if (m.text.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi)) {
this.sendMessage(m.chat, { react: { text: reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)], key: m.key }});
}
}
}
}
global.dfail = (type, m, conn) => { failureHandler(type, conn, m); };
const file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
unwatchFile(file);
console.log(chalk.green('Actualizando "handler.js"...'));
});