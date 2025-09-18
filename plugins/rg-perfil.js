import moment from 'moment-timezone'
import PhoneNumber from 'awesome-phonenumber'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let userId
  if (m.quoted?.sender) {
    userId = m.quoted.sender
  } else if (m.mentionedJid?.[0]) {
    userId = m.mentionedJid[0]
  } else {
    userId = m.sender
  }

  let user = global.db.data.users[userId]
  if (!user) {
    return m.reply('⚠️ El usuario no existe en la base de datos.')
  }

  try {
    let name = await conn.getName(userId).catch(() => 'Sin Nombre')

    let cumpleanos = user.birth || 'No especificado'
    let genero = user.genre || 'No especificado'

    let parejaId = user.marry || null
    let parejaTag = 'Nadie'
    let mentions = [userId]
    if (parejaId && global.db.data.users[parejaId]) {
      parejaTag = `@${parejaId.split('@')[0]}`
      mentions.push(parejaId)
    }

    let description = user.description || 'Sin Descripción'
    let exp = user.exp || 0
    let nivel = user.level || 0
    let role = user.role || 'Sin Rango'
    let coins = user.coin || 0
    let bankCoins = user.bank || 0

    let perfil = await conn.profilePictureUrl(userId, 'image')
      .catch(() => 'https://files.catbox.moe/xr2m6u.jpg')

    let profileText = `
「✿」 *Perfil* ◢@${userId.split('@')[0]}◤
${description}

✦ Edad » ${user.age || 'Desconocida'}
♛ Cumpleaños » ${cumpleanos}
⚥ Género » ${genero}
♡ Casado con » ${parejaTag}

☆ Experiencia » ${exp.toLocaleString()}
❖ Nivel » ${nivel}
✎ Rango » ${role}

⛁ Coins Cartera » ${coins.toLocaleString()} ${moneda}
⛃ Coins Banco » ${bankCoins.toLocaleString()} ${moneda}
❁ Premium » ${user.premium ? '✅' : '❌'}
`.trim()

    await conn.sendMessage(
      m.chat,
      {
        text: profileText,
        contextInfo: {
          mentionedJid: mentions,
          externalAdReply: {
            title: '✧ Perfil de Usuario ✧',
            body: dev,
            thumbnailUrl: perfil,
            mediaType: 1,
            renderLargerThumbnail: true
          }
        }
      },
      { quoted: m }
    )
  } catch (e) {
    await m.reply(`⚠️ Error al mostrar el perfil:\n\n${e.message}`)
  }
}

handler.help = ['profile', 'perfil']
handler.tags = ['rg']
handler.command = ['profile', 'perfil']

export default handler
