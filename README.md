<div align="center">
  <img src="https://i.imgur.com/u4sYHGA.png" alt="Ruby Hoshino Banner" width="600"/>
  <h1>🌸 Ruby Hoshino Bot 🌸</h1>
</div>

<p align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=25&pause=1000&color=F75389&center=true&vCenter=true&width=500&lines=✨+Bienvenido+al+repositorio+oficial+✨;Un+bot+multifuncional+para+WhatsApp;Creado+con+Node.js+y+pasión;¡Gracias+por+estar+aquí!+💖" alt="Typing SVG">
  </a>
</p>

<p align="center">
    <a href="https://github.com/Dioneibi-rip/Ruby-Hoshino-Bot"><img src="https://img.shields.io/github/stars/Dioneibi-rip/Ruby-Hoshino-Bot?style=for-the-badge&logo=github&color=E91E63" alt="GitHub stars"></a>
    <a href="https://github.com/Dioneibi-rip/Ruby-Hoshino-Bot/network/members"><img src="https://img.shields.io/github/forks/Dioneibi-rip/Ruby-Hoshino-Bot?style=for-the-badge&logo=github&color=9C27B0" alt="GitHub forks"></a>
    <img src="https://img.shields.io/github/license/Dioneibi-rip/Ruby-Hoshino-Bot?style=for-the-badge&color=2196F3" alt="License">
    <a href="https://api.whatsapp.com/send/?phone=18294868853&text=Hola,+vengo+de+GitHub+y+necesito+soporte+con+Ruby+Bot&type=phone_number&app_absent=0"><img src="https://img.shields.io/badge/WhatsApp-Soporte-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Support WhatsApp"></a>
</p>

<div align="center">
  <img src="https://files.catbox.moe/atnv7f.gif" alt="Ruby Hoshino Bot Preview" width="350"/>
</div>

---

## 💎 ¿Qué es Ruby Hoshino Bot?

**Ruby Hoshino** es un bot de WhatsApp versátil y lleno de funciones, diseñado para mejorar la experiencia en tus chats y grupos. Desde la gestión automática hasta el entretenimiento, Ruby lo tiene todo. Este proyecto está basado en el trabajo de **Yuki Suou** y ha sido personalizado con cariño por **Dioneibi-rip**.

---

## ✨ Características Principales

| Característica | Descripción |
| :--- | :--- |
| 🎵 **Descargas Multimedia** | Descarga música y videos desde YouTube y otras plataformas directamente a tu chat. |
| 🎨 **Creación de Stickers** | Convierte imágenes, videos o GIFs en stickers, con o sin fondo. |
| 🛡️ **Gestión de Grupos** | Funciones de anti-enlaces, anti-spam, bienvenidas personalizadas y mucho más. |
| 🎮 **Juegos y Entretenimiento** | Diviértete con juegos como Piedra-Papel-Tijera, Tic-Tac-Toe y un sistema RPG. |
| 🤖 **Inteligencia Artificial** | Interactúa con chatbots como Simsimi y un contestador automático inteligente. |
| 🔍 **Búsquedas Rápidas** | Realiza búsquedas en Google, Wikipedia y otras fuentes sin salir de WhatsApp. |

---

## 🚀 Puesta en Marcha

Sigue estos pasos para darle vida a Ruby en tu plataforma preferida.

### `1.` Descarga la Aplicación Necesaria

<p align="center">
  <a href="https://www.mediafire.com/file/llugt4zgj7g3n3u/com.termux_1020.apk/file"><img src="https://img.shields.io/badge/Descargar-Termux-26C6DA?style=for-the-badge&logo=android" alt="Download Termux"></a>
  <a href="https://www.mediafire.com/file/bp2l6cci2p30hjv/Cloud+Shell_1.apk/file"><img src="https://img.shields.io/badge/Descargar-Cloud%20Shell-FF7043?style=for-the-badge&logo=google-cloud" alt="Download Cloud Shell"></a>
</p>

### `2.` Ejecuta los Comandos de Instalación

<details>
<summary><strong>📱 Comandos para Termux</strong></summary>

```bash
# Permite el acceso al almacenamiento
termux-setup-storage

# Actualiza los paquetes e instala las dependencias
apt update && apt upgrade -y
pkg install -y git nodejs ffmpeg imagemagick yarn

# Clona el repositorio y entra en la carpeta
git clone [https://github.com/Dioneibi-rip/Ruby-Hoshino-Bot](https://github.com/Dioneibi-rip/Ruby-Hoshino-Bot)
cd Ruby-Hoshino-Bot

# Instala todas las dependencias del proyecto
yarn install
npm install
npm update

# Inicia el bot
npm start

# Nota: Si el sistema te pregunta (Y/I/N/O/D/Z), escribe "y" y presiona Enter.
````

\</details\>

\<details\>
\<summary\>\<strong\>☁️ Comandos para Cloud Shell / VPS\</strong\>\</summary\>

```bash
# Clona el repositorio y entra en la carpeta
git clone [https://github.com/Dioneibi-rip/Ruby-Hoshino-Bot](https://github.com/Dioneibi-rip/Ruby-Hoshino-Bot)
cd Ruby-Hoshino-Bot

# Instala todas las dependencias del proyecto
yarn install
npm install

# Inicia el bot
npm start

# Asegúrate de tener Node.js v18+ instalado.
```

\</details\>

-----

## ⚙️ Configuración Inicial

Para que el bot te reconozca como propietario (owner), necesitas añadir tu número de teléfono.

1.  **Navega a la carpeta del bot** (si no estás en ella):
    ```bash
    cd Ruby-Hoshino-Bot
    ```
2.  **Abre el archivo de configuración** con nano:
    ```bash
    nano settings.js
    ```
3.  **Ubica la sección `owner`** y reemplaza el número existente con el tuyo, sin el símbolo `+`.
    ```javascript
    // Ejemplo:
    global.owner = [['5211234567890', 'Tu Nombre', true]]
    ```
4.  Guarda los cambios con `Ctrl + O`, presiona `Enter`, y sal con `Ctrl + X`.

-----

## 💬 Comunidad y Soporte

¿Tienes dudas o quieres estar al día con las novedades? ¡Únete a nuestros canales oficiales\!

\<p align="center"\>
\<a href="https://whatsapp.com/channel/0029VakLbM76mYPPFL0IFI3P"\>\<img src="https://www.google.com/search?q=https://img.shields.io/badge/Canal-Oficial-25D366%3Fstyle%3Dfor-the-badge%26logo%3Dwhatsapp%26logoColor%3Dwhite" alt="Canal Oficial"\>\</a\>
\<a href="https://chat.whatsapp.com/K2CPrOTksiA36SW6k41yuR"\>\<img src="https://www.google.com/search?q=https://img.shields.io/badge/Comunidad-Global-0088cc%3Fstyle%3Dfor-the-badge%26logo%3Dwhatsapp%26logoColor%3Dwhite" alt="Grupo Global"\>\</a\>
\</p\>

-----

## 👑 Creador y Colaboradores

Un agradecimiento especial a todos los que han hecho posible este proyecto.

\<table align="center"\>
\<tr\>
\<td align="center"\>
\<a href="https://github.com/Dioneibi-rip"\>
\<img src="https://github.com/Dioneibi-rip.png" width="150" alt="Dioneibi-rip"/\>
\<br /\>
\<sub\>\<b\>Dioneibi-rip (Creador)\</b\>\</sub\>
\</a\>
\</td\>
\</tr\>
\<tr\>
\<td align="center" colspan="2"\>
\<p\>\<b\>Colaboradores Especiales\</b\>\</p\>
\</td\>
\</tr\>
\<tr\>
\<td align="center"\>
\<a href="https://github.com/nevi-dev"\>
\<img src="https://github.com/nevi-dev.png" width="130" alt="nevi-dev"/\>
\<br /\>
\<sub\>\<b\>Nevi-dev\</b\>\</sub\>
\</a\>
\</td\>
\<td align="center"\>
\<a href="https://github.com/Legna-chan"\>
\<img src="https://github.com/Legna-chan.png" width="130" alt="Legna-chan"/\>
\<br /\>
\<sub\>\<b\>Legna-chan\</b\>\</sub\>
\</a\>
\</td\>
\</tr\>
\</table\>

> [\!IMPORTANT]
> **Aviso Legal:** Este proyecto es de código abierto y fue creado con fines educativos y de desarrollo. No está afiliado de ninguna manera con WhatsApp o Meta. El uso comercial o con fines maliciosos está estrictamente prohibido.