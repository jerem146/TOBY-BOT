import fs from 'fs'
import path from 'path'

const marriagesFile = path.resolve('src/database/casados.json')

function loadMarriages() {
    return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {}
}

let marriages = loadMarriages()

function formatTime(ms) {
    const totalMinutes = Math.floor(ms / (1000 * 60))
    const days = Math.floor(totalMinutes / 1440)
    const hours = Math.floor((totalMinutes % 1440) / 60)
    const minutes = totalMinutes % 60
    let result = ''
    if (days) result += `${days}d `
    if (hours) result += `${hours}h `
    if (minutes || (!days && !hours)) result += `${minutes}m`
    return result.trim()
}

const handler = async (m, { conn }) => {
    let parejas = []
    const procesados = new Set()

    for (let user in marriages) {
        if (!procesados.has(user)) {
            const partner = marriages[user]?.partner || marriages[user]
            const date = marriages[user]?.date || marriages[partner]?.date || Date.now()
            if (partner && !procesados.has(partner)) {
                parejas.push({ user, partner, date })
                procesados.add(user)
                procesados.add(partner)
            }
        }
    }

    parejas.sort((a, b) => a.date - b.date)

    let texto = `「✿」Top parejas casadas por tiempo de matrimonio:\n\n`

    for (let i = 0; i < parejas.length; i++) {
        const p = parejas[i]
        const tiempo = formatTime(Date.now() - p.date)
        const nombreUser = await conn.getName(p.user)
        const nombrePartner = await conn.getName(p.partner)
        texto += `${i + 1}. ${nombreUser} ❤️ ${nombrePartner} → *${tiempo} casados*\n`
    }

    await conn.reply(m.chat, texto.trim(), m)
}

handler.help = ['topmarried']
handler.tags = ['fun']
handler.command = ['topmarry', 'topparejas']
handler.group = true

export default handler
