import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'
import failureHandler from './lib/respuesta.js';

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

const getLidFromJid = async (id, conn) => {
    if (id.endsWith('@lid')) return id;
    const res = await conn.onWhatsApp(id).catch(() => []);
    return res[0]?.lid || id;
}

const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];

const defaultUser = {
    exp: 0, coin: 10, joincount: 1, diamond: 3, lastadventure: 0, health: 100, lastclaim: 0, lastcofre: 0, 
    lastdiamantes: 0, lastcode: 0, lastduel: 0, lastpago: 0, lastmining: 0, lastcodereg: 0, muto: false, 
    registered: false, genre: '', birth: '', marry: '', description: '', packstickers: null, age: -1, 
    regTime: -1, afk: -1, afkReason: '', banned: false, useDocument: false, bank: 0, level: 0, 
    role: 'Nuv', premium: false, premiumTime: 0, warn: 0
};

const defaultChat = {
    isBanned: false, sAutoresponder: '', welcome: true, autolevelup: false, autoresponder: false, 
    delete: false, autoAceptar: false, autoRechazar: false, detect: true, antiBot: false, 
    antiBot2: false, modoadmin: false, antiLink: true, antifake: false, antiArabe: false, reaction: false, 
    nsfw: false, expired: 0, welcomeText: null, byeText: null, botPrimario: null
};

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    this.uptime = this.uptime || Date.now()
    if (!chatUpdate) return

    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]

    if (!m) return
    if (m.isBaileys) return

    if (global.db.data == null) await global.loadDatabase()

    try {
        m = smsg(this, m) || m
        if (!m) return

        const initialChat = global.db.data.chats[m.chat];
        if (initialChat?.botPrimario && initialChat.botPrimario !== this.user.jid) {
            const universalWords = ['resetbot', 'resetprimario', 'botreset'];
            const firstWord = m.text ? m.text.trim().split(' ')[0].toLowerCase() : '';
            if (!universalWords.includes(firstWord)) {
                return;
            }
        }
        
        m.exp = 0
        m.coin = false

        try {
            const user = global.db.data.users[m.sender];
            global.db.data.users[m.sender] = { ...defaultUser, ...(user || {}), name: m.name };
            
            const chat = global.db.data.chats[m.chat];
            global.db.data.chats[m.chat] = { ...defaultChat, ...(chat || {}) };

            let settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('restrict' in settings)) settings.restrict = true
                if (!('jadibotmd' in settings)) settings.jadibotmd = true
                if (!('antiPrivate' in settings)) settings.antiPrivate = false
                if (!('autoread' in settings)) settings.autoread = false
            } else {
                 global.db.data.settings[this.user.jid] = { self: false, restrict: true, jadibotmd: true, antiPrivate: false, autoread: false, status: 0 }
            }
        } catch (e) {
            console.error(e)
        }

        const _user = global.db.data.users[m.sender]
        if (typeof m.text !== 'string') m.text = ''

        const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net';
        const isROwner = [...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isROwner || global.mods.map(v => v.replace(/[^0-g]/g, '') + detectwhat).includes(m.sender)
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '') + detectwhat).includes(m.sender) || _user.premium

        if (opts['nyimak']) return
        if (!isROwner && opts['self']) return
        if (opts['swonly'] && m.chat !== 'status@broadcast') return

        m.exp += Math.ceil(Math.random() * 10)

        let usedPrefix

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue

            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
                } catch (e) { console.error(e) }
            }

            if (!opts['restrict'] && plugin.tags && plugin.tags.includes('admin')) continue

            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? _prefix.map(p => { let re = p instanceof RegExp ? p : new RegExp(str2Regex(p)); return [re.exec(m.text), re] }) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                [[[], new RegExp]]
            ).find(p => p[1])

            if ((usedPrefix = (match[0] || '')[0])) {
                const groupMetadata = m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}
                const participants = m.isGroup ? (groupMetadata.participants || []) : []
                const senderParticipant = m.isGroup ? participants.find(p => p.id === m.sender) || {} : {}
                const bot = m.isGroup ? participants.find(p => p.id === conn.user.jid) || {} : {}
                const isRAdmin = senderParticipant?.admin === "superadmin"
                const isAdmin = isRAdmin || senderParticipant?.admin === "admin"
                const isBotAdmin = !!bot?.admin
                
                if (typeof plugin.before === 'function') {
                    if (await plugin.before.call(this, m, { match, conn: this, participants, groupMetadata, user: senderParticipant, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename }))
                    continue
                }
                
                if (typeof plugin !== 'function') continue
                
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail

                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false

                if (!isAccept) continue

                m.plugin = name
                let chat = global.db.data.chats[m.chat]
                
                if (chat?.isBanned && !isROwner && !['grupo-unbanchat.js', 'owner-exec.js', 'owner-exec2.js'].includes(name)) return
                if (_user?.banned && !isROwner && !['owner-unbanuser.js'].includes(name)) {
                    return m.reply(`《✦》Estas baneado/a, no puedes usar comandos en este bot!\n\n${_user.bannedReason ? `✰ *Motivo:* ${_user.bannedReason}` : '✰ *Motivo:* Sin Especificar'}`)
                }
                
                if (chat?.modoadmin && !isAdmin && !isOwner && m.isGroup) return

                if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue }
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue }
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
                if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
                if (plugin.private && m.isGroup) { fail('private', m, this); continue }
                if (plugin.register && !_user.registered) { fail('unreg', m, this); continue }

                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10
                m.exp += xp
                if (!isPrems && plugin.coin && _user.coin < plugin.coin * 1) {
                    return conn.reply(m.chat, `❮✦❯ Se agotaron tus ${moneda}`, m)
                }
                if (plugin.level > _user.level) {
                    return conn.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n\n• Tu nivel actual es: *${_user.level}*\n\n• Usa este comando para subir de nivel:\n*${usedPrefix}levelup*`, m)
                }

                let extra = { match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata, user: senderParticipant, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename }
                
                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems) m.coin = m.coin || plugin.coin || false
                } catch (e) {
                    m.error = e
                    console.error(e)
                    if (e) {
                        let text = format(e)
                        for (let key of Object.values(global.APIKeys))
                            text = text.replace(new RegExp(key, 'g'), 'Administrador')
                        m.reply(text)
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try { await plugin.after.call(this, m, extra) } 
                        catch (e) { console.error(e) }
                    }
                    if (m.coin) conn.reply(m.chat, `❮✦❯ Utilizaste ${+m.coin} ${moneda}`, m)
                }
                break
            }
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (m) {
            if (m.sender && global.db.data.users[m.sender]) {
                global.db.data.users[m.sender].exp += m.exp
                global.db.data.users[m.sender].coin -= m.coin * 1
            }
        }
        
        try {
            if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
        } catch (e) {
            console.log(m, m.quoted, e)
        }
        
        if (opts['autoread']) await this.readMessages([m.key])
        
        if (global.db.data.chats[m.chat]?.reaction && !m.fromMe) {
            const reactionRegex = /(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi;
            if (m.text.match(reactionRegex)) {
                let emot = pickRandom(["🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "🌺", "🌸", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🌟", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "💫", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😶‍🌫️", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤖", "🍭", "🤫", "🫠", "🤥", "😶", "📇", "😐", "💧", "😑", "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👺", "🧿", "🌩", "👻", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🫶", "👍", "✌️", "🙏", "🫵", "🤏", "🤌", "☝️", "🖕", "🙏", "🫵", "🫂", "🐱", "🤹‍♀️", "🤹‍♂️", "🗿", "✨", "⚡", "🔥", "🌈", "🩷", "❤️", "🧡", "💛", "💚", "🩵", "💙", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🚩", "👊", "⚡️", "💋", "🫰", "💅", "👑", "🐣", "🐤", "🐈"]);
                this.sendMessage(m.chat, { react: { text: emot, key: m.key } });
            }
        }
    }
}

global.dfail = (type, m, conn) => { failureHandler(type, conn, m); };

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.magenta("Se actualizo 'handler.js'"))

    if (global.conns && global.conns.length > 0) {
        const users = [...new Set([...global.conns.filter(conn => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map(conn => conn)])];
        for (const userr of users) {
            userr.subreloadHandler(false);
        }
    }
})