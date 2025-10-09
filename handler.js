import { smsg } from './lib/simple.js'
import { format } from 'util'
import * as ws from 'ws';
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function () {
clearTimeout(this)
resolve()
}, ms))

// Objeto de usuario por defecto para mantener la consistencia
const DEFAULT_USER = {
    exp: 0,
    coin: 10,
    diamond: 3,
    joincount: 1,
    health: 100,
    bank: 0,
    level: 0,
    warn: 0,
    role: 'Nuv',
    registered: false,
    name: '',
    age: -1,
    regTime: -1,
    premium: false,
    premiumTime: 0,
    // Timestamps de cooldowns
    lastadventure: 0,
    lastclaim: 0,
    lastcrime: 0,
    lastcofre: 0,
    lastdiamantes: 0,
    lastpago: 0,
    lastcode: 0,
    lastcodereg: 0,
    lastduel: 0,
    lastmining: 0,
    // Otros
    afk: -1,
    afkReason: '',
    muto: false,
    banned: false,
    useDocument: false,
    genre: '',
    birth: '',
    marry: '',
    description: '',
    packstickers: null
};

export async function handler(chatUpdate) {
this.msgqueque = this.msgqueque || []
this.uptime = this.uptime || Date.now()
if (!chatUpdate)
return
this.pushMessage(chatUpdate.messages).catch(console.error)
let m = chatUpdate.messages[chatUpdate.messages.length - 1]
if (!m)
return;
if (global.db.data == null)
await global.loadDatabase()

try {
m = smsg(this, m) || m
if (!m)
return

if (m.isGroup) {
    const chat = global.db.data.chats[m.chat];
    if (chat?.primaryBot) {
        const universalWords = ['resetbot', 'resetprimario', 'botreset'];
        const firstWord = m.text ? m.text.trim().split(' ')[0].toLowerCase().replace(/^[./#]/, '') : '';
        if (!universalWords.includes(firstWord)) {
            if (this?.user?.jid !== chat.primaryBot) {
                return;
            }
        }
    }
}

const sender = m.isGroup ? (m.key.participant ? m.key.participant : m.sender) : m.key.remoteJid;

// --- INICIO DE LA CORRECCIÓN DE ECONOMÍA ---
// Lógica unificada para inicializar y reparar usuarios
try {
    let user = global.db.data.users[sender];
    if (user) {
        // Si el usuario existe, recorremos el objeto por defecto para asegurarnos de que no le falte ninguna propiedad.
        for (let key in DEFAULT_USER) {
            if (user[key] === undefined || user[key] === null) {
                user[key] = DEFAULT_USER[key];
            }
            // Aseguramos que las propiedades numéricas siempre sean números
            if (typeof DEFAULT_USER[key] === 'number' && !isNumber(user[key])) {
                user[key] = DEFAULT_USER[key];
            }
        }
    } else {
        // Si el usuario no existe, lo creamos con todas las propiedades por defecto.
        global.db.data.users[sender] = {
            ...DEFAULT_USER,
            name: m.name // Usamos el nombre actual del usuario
        };
    }
} catch (e) {
    console.error(`Error al inicializar/reparar el usuario ${sender}:`, e);
}
// --- FIN DE LA CORRECCIÓN DE ECONOMÍA ---

let chat = global.db.data.chats[m.chat]
if (typeof chat !== 'object')
global.db.data.chats[m.chat] = {}
if (chat) {
    if (!('isBanned' in chat)) chat.isBanned = false
    if (!('welcome' in chat)) chat.welcome = true
    if (!('detect' in chat)) chat.detect = true
    if (!('sWelcome' in chat)) chat.sWelcome = ''
    if (!('sBye' in chat)) chat.sBye = ''
    if (!('sPromote' in chat)) chat.sPromote = ''
    if (!('sDemote' in chat)) chat.sDemote = ''
    if (!('delete' in chat)) chat.delete = true
    if (!('antiLink' in chat)) chat.antiLink = false
    if (!('viewonce' in chat)) chat.viewonce = false
    if (!('modoadmin' in chat)) chat.modoadmin = false
    if (!('nsfw' in chat)) chat.nsfw = false
    // Estandarizamos a 'primaryBot' para consistencia
    if (!('primaryBot' in chat)) chat.primaryBot = null
} else
global.db.data.chats[m.chat] = {
    isBanned: false,
    welcome: true,
    detect: true,
    sWelcome: '',
    sBye: '',
    sPromote: '',
    sDemote: '',
    delete: true,
    antiLink: false,
    viewonce: false,
    modoadmin: false,
    nsfw: false,
    primaryBot: null,
}

var settings = global.db.data.settings[this.user.jid]
if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
if (settings) {
    if (!('self' in settings)) settings.self = false
    if (!('autoread' in settings)) settings.autoread = false
    if (!('restrict' in settings)) settings.restrict = false
} else global.db.data.settings[this.user.jid] = {
    self: false,
    autoread: false,
    restrict: false,
}

// Inicialización de m.exp y m.coin (importante para el finally)
m.exp = 0
m.coin = 0 // Inicializar a 0 en vez de false para evitar errores de cálculo


if (opts['nyimak']) return
if (!m.fromMe && opts['self']) return

if (typeof m.text !== 'string')
m.text = ''

const _user = global.db.data.users[sender]
const groupMetadata = m.isGroup ? await this.groupMetadata(m.chat).catch(_ => null) : {}
const participants = m.isGroup ? groupMetadata.participants : []
const userGroup = m.isGroup ? participants.find(u => this.decodeJid(u.id) === sender) : {}
const botGroup = m.isGroup ? participants.find(u => this.decodeJid(u.id) === this.user.jid) : {}
const isRAdmin = userGroup?.admin === 'superadmin' || false
const isAdmin = isRAdmin || userGroup?.admin === 'admin' || false
const isBotAdmin = botGroup?.admin === 'admin' || false

const isROwner = global.owner.map(([number]) => number).includes(sender.split('@')[0])
const isOwner = isROwner || m.fromMe
const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '')).includes(sender.split('@')[0]) || _user?.premium

if (m.isBaileys) return
// La ganancia de exp por mensaje se puede manejar aquí si se desea
// _user.exp += Math.ceil(Math.random() * 3)

let usedPrefix
const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
for (let name in global.plugins) {
    let plugin = global.plugins[name]
    if (!plugin) continue
    if (plugin.disabled) continue
    const __filename = join(___dirname, name)
    if (typeof plugin.all === 'function') {
        try {
            await plugin.all.call(this, m, {
                chatUpdate,
            })
        } catch (e) {
            console.error(e)
        }
    }

    const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix
    let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] : Array.isArray(_prefix) ? _prefix.map(p => {
        let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
        return [re.exec(m.text), re]
    }) : typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] : [[[], new RegExp]]).find(p => p[1])
    
    if (typeof plugin.before === 'function') {
        if (await plugin.before.call(this, m, { match, conn: this, participants, groupMetadata, user: userGroup, bot: botGroup, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename }))
        continue
    }

    if (typeof plugin !== 'function') continue
    if ((usedPrefix = (match[0] || '')[0])) {
        let noPrefix = m.text.replace(usedPrefix, '')
        let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
        args = args || []
        let _args = noPrefix.trim().split` `.slice(1)
        let text = _args.join` `
        command = (command || '').toLowerCase()
        let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) : Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) : typeof plugin.command === 'string' ? plugin.command === command : false

        if (!isAccept) continue
        m.plugin = name
        
        // Verificaciones de usuario y chat
        let user = global.db.data.users[sender], chat = global.db.data.chats[m.chat]
        if (chat?.isBanned && !isROwner) return
        if (user?.banned && !isROwner) return
        
        let adminMode = global.db.data.chats[m.chat].modoadmin
        if (adminMode && m.isGroup && !isAdmin && !isOwner) return

        if (plugin.owner && !isOwner) continue
        if (plugin.premium && !isPrems) continue
        if (plugin.group && !m.isGroup) continue
        if (plugin.admin && !isAdmin) continue
        if (plugin.botAdmin && !isBotAdmin) continue
        if (plugin.register && !user.registered) continue

        // Lógica de costo de coin
        let coinCost = plugin.coin || 0
        if (coinCost > 0 && user.coin < coinCost && !isPrems) {
            this.reply(m.chat, `Te faltan ${coinCost - user.coin} coins para usar este comando.`, m)
            continue
        }

        let extra = { match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata, user: userGroup, bot: botGroup, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename }
        try {
            await plugin.call(this, m, extra)
            // Solo se resta el coin si el comando fue exitoso
            if (coinCost > 0 && !isPrems) {
                 user.coin -= coinCost
            }
        } catch (e) {
            m.error = e
            console.error(e)
        } finally {
            if (typeof plugin.after === 'function') {
                try {
                    await plugin.after.call(this, m, extra)
                } catch (e) { console.error(e) }
            }
        }
        break
    }
}
} catch (e) {
    console.error(e)
} finally {
    // La modificación final de exp y coin se puede hacer aquí, pero es más seguro hacerlo directamente en los plugins
    // por ejemplo, si un comando de 'claim' fue exitoso.
    // El modelo actual de restar 'm.coin' es propenso a errores, por eso lo moví dentro del 'try' del plugin.
    
    // Imprimir el mensaje en la consola
    if (m) {
        try {
if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
} catch (e) { console.log(m, m.quoted, e) }
let settingsREAD = global.db.data.settings[this.user.jid] || {}
// if (settingsREAD.autoread) await this.readMessages([m.key]) 

}
}
global.dfail = (type, m, conn) => { failureHandler(type, conn, m); };
const file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
unwatchFile(file);
console.log(chalk.green('Actualizando "handler.js"'));
if (global.conns && global.conns.length > 0 ) {
const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
for (const userr of users) { userr.subreloadHandler(false) }
}
});