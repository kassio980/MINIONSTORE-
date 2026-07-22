// ✅ 1º CARREGA VARIÁVEIS
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');

// ✅ 2º CARREGA CONFIG
const config = require('./config');

// ✅ 3º VALIDA TOKEN
const TOKEN = process.env.BOT_TOKEN || config.bot.token;
if (!TOKEN || TOKEN === '' || TOKEN.includes('COLOQUE')) {
  console.error('❌ TOKEN INVÁLIDO — cadastre BOT_TOKEN no .env / Render');
  process.exit(1);
}
console.log('✅ Variáveis carregadas');

// ✅ 4º VALORES FIXOS
const SERVIDOR_AUTORIZADO = "1505876225946812440";
const CANAL_VOZ_ID = "1528719886942212186";

// ✅ 5º CRIA O BOT — A PARTIR DAQUI PODE USAR bot.xxx
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ✅ 6º CARREGA SISTEMAS
const db = require('./database');
const ui = require('./systems/ui');
const extras = require('./systems/sistemasExtras');
const gerImg = require('./systems/geradorImagem');
const lb = require('./systems/layoutBuilder');
const pix = require('./systems/pix');
const comprovante = require('./systems/comprovante');
const pix = require('./systems/pix');
const comprovante = require('./systems/comprovante');
require('./systems/webserver');

// ✅ 7º REGISTRO GLOBAL
bot.comandos = new Collection();
bot.db = db;
bot.ui = ui;
bot.extras = extras;
bot.gerImg = gerImg;
bot.lb = lb;
bot.pix = pix;
bot.comprovante = comprovante;
bot.config = config;
bot.pix = pix;
bot.comprovante = comprovante;
bot.SERVIDOR = SERVIDOR_AUTORIZADO;
bot._acoes = {};
require("./systems/acoes_parte1")(bot);
require("./systems/acoes_parte2")(bot);
console.log('✅ Ações carregadas');

// ✅ 8º SEGURANÇA
function SEGURANCA(i){
  if(!i.guild) return false;
  if(i.guild.id !== SERVIDOR_AUTORIZADO){
    console.log(`🛑 BLOQUEADO: ${i.guild.id}`);
    return false;
  }
  return true;
}
bot.on('guildCreate', g => { if(g.id !== SERVIDOR_AUTORIZADO) g.leave().catch(()=>{}) });

// ✅ 9º CARREGA COMANDOS RECURSIVO (ADMIN + PUBLICO)
function carregarComandos(pasta){
  if(!fs.existsSync(pasta)) return;
  fs.readdirSync(pasta).forEach(arq => {
    const cam = path.join(pasta, arq);
    if(fs.statSync(cam).isDirectory()) return carregarComandos(cam);
    if(!arq.endsWith('.js')) return;
    try{
      const c = require(cam);
      if(c?.data?.name){ bot.comandos.set(c.data.name, c); console.log(`✅ CMD: /${c.data.name}`); }
    }catch(e){ console.log(`❌ CMD ERRO ${arq}:`, e.message) }
  });
}
carregarComandos(path.join(__dirname,'commands'));
console.log(`📦 ${bot.comandos.size} comandos prontos`);

// ✅ 10º CANAL DE VOZ FIXO
let conexaoVoz = null;
const entrarCanal = async () => {
  try{
    const g = await bot.guilds.fetch(SERVIDOR_AUTORIZADO);
    const c = await g.channels.fetch(CANAL_VOZ_ID);
    if(!c || c.type !== 2) throw new Error('Canal inválido');
    conexaoVoz = joinVoiceChannel({ channelId:c.id, guildId:g.id, adapterCreator:g.voiceAdapterCreator });
    conexaoVoz.on(VoiceConnectionStatus.Ready, () => console.log('🔊 Voz conectada'));
    conexaoVoz.on(VoiceConnectionStatus.Disconnected, async () => {
      try{ await Promise.race([
        entersState(conexaoVoz, VoiceConnectionStatus.Signalling, 4000),
        entersState(conexaoVoz, VoiceConnectionStatus.Connecting, 4000)
      ]) }catch{ conexaoVoz?.destroy(); setTimeout(entrarCanal, 3000) }
    });
  }catch(e){ console.log('⚠️ Voz tentando em 10s:', e.message); setTimeout(entrarCanal, 10000) }
};
bot.on("voiceStateUpdate", (a, n) => {
  if(n.member.id !== bot.user.id) return;
  if(!n.channelId || n.channelId !== CANAL_VOZ_ID) setTimeout(entrarCanal, 1500);
});

// ✅ 11º READY
bot.on('clientReady', () => {
  bot.guilds.cache.forEach(g => { if(g.id !== SERVIDOR_AUTORIZADO) g.leave().catch(()=>{}) });
  console.log(`\n🟡 ${config.loja.nome.toUpperCase()} ONLINE 🚀`);
  console.log(`🤖 ${bot.user.tag}`);
  console.log(`🔒 Servidor: ${SERVIDOR_AUTORIZADO}\n`);
  bot.user.setActivity({name:'🍌 Minions Store',type:3});
  entrarCanal();
});

// ✅ 12º ANTI CRASH
process.on('unhandledRejection', e => console.log('⚠️ ERRO:', e.message));
process.on('uncaughtException', e => console.log('⚠️ FATAL:', e.message));

// ✅ 13º TRATADOR DE INTERAÇÕES — SEM ERRO DE REPLY
bot.on('interactionCreate', async i => {
  if(!SEGURANCA(i)){
    if(!i.replied && !i.deferred) await i.reply({content:'❌ Só no servidor autorizado',ephemeral:true}).catch(()=>{});
    return;
  }

  // COMANDOS DE BARRA
  if(i.isChatInputCommand()){
    const cmd = bot.comandos.get(i.commandName);
    if(!cmd) return i.reply({content:`❌ /${i.commandName} não existe`,ephemeral:true}).catch(()=>{});
    try{ await cmd.execute(i, { bot, config, db, ui, extras, gerImg, lb, pix, comprovante }); }
    catch(e){
      console.error(`❌ /${i.commandName}:`, e.message);
      if(!i.replied && !i.deferred) await i.reply({content:'❌ Erro interno',ephemeral:true}).catch(()=>{});
      else if(i.deferred) await i.editReply({content:'❌ Erro interno'}).catch(()=>{});
    }
    return;
  }

  // MODAIS — NÃO PODE CHAMAR deferUpdate
  if(i.isModalSubmit()){
    const id = `modal:${i.customId}`;
    const fn = bot._acoes[id];
    if(fn){ try{ await fn(i); }catch(e){ console.error('MODAL:',e); await i.reply({content:'❌ Erro',ephemeral:true}).catch(()=>{}) } }
    else await i.reply({content:'⚠️ Modal sem ação',ephemeral:true}).catch(()=>{});
    return;
  }

  // BOTÕES / MENUS
  if(!i.replied && !i.deferred) await i.deferUpdate().catch(()=>{});
  let tipo = i.isButton() ? 'btn:' : i.isStringSelectMenu() ? 'menu:' : null;
  if(!tipo) return;
  const id = `${tipo}${i.customId}`;
  let fn = bot._acoes[id];
  if(!fn){ for(const [k,v] of Object.entries(bot._acoes)){ if(k.endsWith('_*') && id.startsWith(k.slice(0,-2))){ fn=v; break } } }
  if(fn){ try{ await fn(i); }catch(e){ console.error('AÇÃO:',e); await i.followUp({content:'❌ Erro',ephemeral:true}).catch(()=>{}) } }
});

// ✅ 14º LOGIN
bot.login(TOKEN)
.then(() => console.log('🔑 Login OK'))
.catch(e => { console.error('❌ LOGIN:', e.message); process.exit(1) });
