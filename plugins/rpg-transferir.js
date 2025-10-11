async function handler(m, { conn, args, usedPrefix, command }) {

  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  } else {
    who = m.chat;
  }

  if (!who) {
    return m.reply(`✳️ Etiqueta o responde al mensaje del usuario al que quieres transferir.`);
  }

  const amountText = args.find(arg => !arg.startsWith('@') && isNumber(arg));
  if (!amountText) {
      return m.reply(`✳️ Debes especificar la cantidad de ${moneda} que quieres transferir.\n> *Ejemplo:* ${usedPrefix + command} 1000 @usuario`);
  }

  const count = Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, parseInt(amountText)));
  const user = global.db.data.users[m.sender];
  const type = 'coin';
  const bankType = 'bank';

  if (user[bankType] < count) {
    return m.reply(`⚠️ No tienes suficientes ${moneda} en el banco para realizar la transferencia.`);
  }
  
  if (!(who in global.db.data.users)) {
    return m.reply(`❌ El usuario no se encuentra en mi base de datos.`);
  }

  if (who === m.sender) {
    return m.reply(`❌ No puedes transferirte dinero a ti mismo.`);
  }

  user[bankType] -= count;
  global.db.data.users[who][type] += count;

  const mentionText = `@${who.split('@')[0]}`;
  
  m.reply(`✅ ¡Transferencia exitosa!\n\n› Has enviado *${count.toLocaleString()} ${moneda}* a ${mentionText}.\n› Te quedan *${user[bankType].toLocaleString()} ${moneda}* en el banco.`, null, { mentions: [who] });
}

handler.help = ['pay <cantidad> @usuario'];
handler.tags = ['rpg'];
handler.command = ['pay', 'transfer'];
handler.group = true;
handler.register = true;

export default handler;

function isNumber(x) {
  // Una comprobación más estricta para números
  if (typeof x === 'string') {
    x = x.trim();
  }
  return !isNaN(x) && x !== '';
}