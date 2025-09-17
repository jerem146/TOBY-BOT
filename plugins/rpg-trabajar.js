let cooldowns = {};

const handler = async (m, { conn }) => {
    let user = global.db.data.users[m.sender];
    if (!user.coin) user.coin = 0;
    if (!user.bank) user.bank = 0;

    const premiumBenefit = user.premium ? 1.25 : 1.0;
    const cooldown = 3 * 60 * 1000;

    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < cooldown) {
        const remaining = segundosAHMS(Math.ceil((cooldowns[m.sender] + cooldown - Date.now()) / 1000));
        return conn.reply(m.chat, `💛 Tómate un descanso, ya trabajaste mucho. Vuelve en *${remaining}*.`, m);
    }

    const winChance = 0.85;
    const didWin = Math.random() < winChance;

    if (didWin) {
        const amount = Math.floor((Math.random() * 4000 + 1000) * premiumBenefit);
        user.coin += amount;
        const work = pickRandom(trabajosBuenos);
        await conn.reply(m.chat, `✿ ${work} y te llevaste *¥${amount.toLocaleString()} ${moneda}*.\n\n💰 Cartera: *¥${user.coin.toLocaleString()}* | 🏦 Banco: *¥${user.bank.toLocaleString()}*`, m);
    } else {
        const amount = Math.floor(Math.random() * 3000 + 500);
        let total = user.coin + user.bank;
        let loss = Math.min(total, amount);

        if (user.coin >= loss) {
            user.coin -= loss;
        } else {
            let resto = loss - user.coin;
            user.coin = 0;
            user.bank = Math.max(0, user.bank - resto);
        }

        const work = pickRandom(trabajosMalos);
        await conn.reply(m.chat, `🥀 ${work} y perdiste *¥${amount.toLocaleString()} ${moneda}*.\n\n💰 Cartera: *¥${user.coin.toLocaleString()}* | 🏦 Banco: *¥${user.bank.toLocaleString()}*`, m);
    }

    cooldowns[m.sender] = Date.now();
};

handler.help = ['chamba', 'trabajar', 'work'];
handler.tags = ['economy'];
handler.command = ['chamba', 'trabajar', 'w', 'work', 'chambear'];
handler.group = true;
handler.register = true;

export default handler;

function segundosAHMS(segundos) {
    let minutos = Math.floor(segundos / 60);
    let segundosRestantes = segundos % 60;
    return `${minutos}m ${segundosRestantes}s`;
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

const trabajosBuenos = [
    "Le vendiste una PC gamer a un niño rata con la tarjeta de su mamá",
    "Fuiste mesero en un bar de furros y te dieron buena propina",
    "Programaste un troyano para un político y te pagó bien",
    "Vendiste fotos de tus patas en OnlyFans",
    "Ganaste un torneo local de Street Fighter",
    "Hiciste de extra en una película de bajo presupuesto",
    "Te contrataron para cuidar el perro de un millonario",
    "Vendiste agua embotellada del grifo afuera de un concierto",
    "Hackeaste la red del vecino y le vendiste su propio internet",
    "Fuiste DJ en una fiesta de XV años",
    "Le enseñaste a un viejo a usar su celular",
    "Trabajaste de payaso de crucero y no te fue tan mal",
    "Editaste un video para un youtuber famoso",
    "Vendiste un dibujo furro por una cantidad ridícula de dinero",
    "Hiciste de guardaespaldas en un evento otaku",
    "Te pagaron por hacer fila para comprar unas zapatillas de edición limitada",
    "Tradujiste un doujinshi del japonés al español",
    "Le diste la paliza de su vida a un bully por dinero",
    "Ganaste una apuesta sobre quién aguantaba más picante",
    "Creaste un filtro viral de Instagram"
];

const trabajosMalos = [
    "Intentaste vender Avon pero terminaste comprando todo tú",
    "Te pagaron con un billete falso de 500",
    "Tu jefe te corrió por llegar tarde y oliendo a alcohol",
    "Te asaltaron mientras hacías una entrega de Rappi",
    "Le instalaste un virus a tu cliente por accidente y tuviste que pagarle una PC nueva",
    "Te quedaste dormido en el metro y te robaron la cartera",
    "Invertiste en una criptomoneda de un perro y se fue a cero",
    "Te multaron por no recoger la caca de tu perro imaginario",
    "Compraste un curso para ser millonario y solo te estafaron",
    "Intentaste revender boletos y te los rompieron en la cara",
    "El cliente te hizo un reembolso en PayPal y te quedaste sin el producto y sin el dinero",
    "Te caíste de la bicicleta trabajando y tuviste que pagar los gastos médicos",
    "Te pagaron con un cheque sin fondos",
    "Limpiaste la casa equivocada y te demandaron por allanamiento",
    "Te descontaron el día por ver memes en horario laboral"
];
