let cooldowns = {};
let jail = {};

const handler = async (m, { conn }) => {
    let users = global.db.data.users;
    let senderId = m.sender;

    if (typeof users[senderId].coin !== "number") users[senderId].coin = 0;
    if (typeof users[senderId].bank !== "number") users[senderId].bank = 0;

    const premiumBenefit = users[senderId].premium ? 0.8 : 1.0;
    const cooldown = 5 * 60 * 1000; // 5 minutos
    const jailCooldown = 30 * 60 * 1000;

    if (jail[senderId] && Date.now() < jail[senderId]) {
        const remaining = segundosAHMS(Math.ceil((jail[senderId] - Date.now()) / 1000));
        return m.reply(`🚔 Estás tras las rejas. Te quedan *${remaining}*.`);
    }

    if (cooldowns[senderId] && Date.now() - cooldowns[senderId] < cooldown) {
        const remaining = segundosAHMS(Math.ceil((cooldowns[senderId] + cooldown - Date.now()) / 1000));
        return m.reply(`⏱️ La policía todavía está investigando. Espera *${remaining}* para delinquir de nuevo.`);
    }

    const outcome = Math.random();
    const jailChance = 0.15 * premiumBenefit; // 15% (12% para premium)
    const successChance = 0.60; // 60% de éxito

    if (outcome < jailChance) {
        jail[senderId] = Date.now() + jailCooldown;
        const reason = pickRandom(frasesPolicia);
        return m.reply(`🚓 ${reason}. Estás en la cárcel por 30 minutos.`);
    } else if (outcome < jailChance + successChance) {
        const amount = Math.floor(Math.random() * 15000 + 5000);
        users[senderId].coin += amount;
        const reason = pickRandom(frasesExito);
        await m.reply(`💰 ${reason} y ganaste *¥${amount.toLocaleString()} ${moneda}*.`, m);
    } else {
        const amount = Math.floor(Math.random() * 25000 + 10000);
        let total = users[senderId].coin + users[senderId].bank;
        let loss = Math.min(total, amount);

        if (users[senderId].coin >= loss) {
            users[senderId].coin -= loss;
        } else {
            let resto = loss - users[senderId].coin;
            users[senderId].coin = 0;
            users[senderId].bank = Math.max(0, users[senderId].bank - resto);
        }

        const reason = pickRandom(frasesFracaso);
        await m.reply(`💀 ${reason} y perdiste *¥${loss.toLocaleString()} ${moneda}*.`, m);
    }

    cooldowns[senderId] = Date.now();
};

handler.help = ['crimen'];
handler.tags = ['economy'];
handler.command = ['crimen', 'crime'];
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

const frasesExito = [
    "Asaltaste un camión de Brinks con una pistola de agua y nadie se dio cuenta",
    "Hackeaste la cuenta de Twitch de un streamer famoso y te donaste a ti mismo",
    "Robaste un cargamento de PlayStation 5 y los revendiste al triple",
    "Creaste un NFT de un gato gigante y alguien lo compró",
    "Hiciste una estafa de boletos falsos para un concierto y te pagaron",
    "Te disfrazaste de inspector de impuestos y cobraron multas inventadas",
    "Vendiste un mapa del tesoro falso a turistas crédulos",
    "Hackeaste la máquina de chicles del colegio y la revendiste",
    "Pusiste un puesto de fotos ridículas en el parque y recaudaste dinero",
    "Robaste un carrito de helados y lo vendiste en la esquina",
    "Hiciste una venta de 'agua milagrosa' que en realidad era agua de lluvia",
    "Fuiste ladrón de medallas de chocolate en la feria local",
    "Engañaste a un NPC en un videojuego online y le robaste monedas virtuales",
    "Organizaste un torneo de pelea de almohadas y cobraste entrada"
];

const frasesFracaso = [
    "Descubrieron que hacías evasión de impuestos",
    "Intentaste robar un banco pero estaba cerrado",
    "Te tropezaste mientras huías y rompiste la cara",
    "Le intentaste robar a una viejita y ella te golpeó con su bastón",
    "Tu cómplice te delató a cambio de reducir su sentencia",
    "Quedaste atrapado en la chimenea de una casa intentando robar",
    "Publicaste tu crimen en Instagram por accidente",
    "La policía te rastreó porque usaste tu tarjeta para comprar el pasamontañas",
    "Intentaste hackear el Pentágono con un tutorial de YouTube",
    "Te explotó una bomba de tinta en la ropa mientras huías",
    "Intentaste escapar en monociclo y no llegaste lejos",
    "El perico de la víctima te delató porque repetía tu nombre",
    "Gastaste todo el botín en skins de videojuegos",
    "Dejaste tu DNI en la escena del crimen",
    "Tatuaste el plan del robo en la espalda y tu compañero lo fotografió"
];

// Frases de policía
const frasesPolicia = [
    "Te atraparon porque tu mamá dijo a la policía dónde estabas",
    "Un dron de la policía te siguió hasta tu casa",
    "Quedaste dormido en el coche de la huida",
    "Intentaste sobornar al policía con 10 dólares y se ofendió",
    "Te encontraron escondido en un contenedor de basura roncando",
    "Tu ex-novia te delató, tenía tu ubicación en tiempo real",
    "La policía analizó ADN que dejaste en la escena",
    "Un vecino te reconoció y llamó a la policía"
];
