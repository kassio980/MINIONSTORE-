const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// 🔒 SÓ ESSE SERVIDOR DEVE FUNCIONAR
const SERVIDOR_AUTORIZADO = "1505876225946812440";

// ==========================================
// 🤖 CRIA O BOT
// ==========================================
const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// ==========================================
// 📦 CARREGA DEPENDÊNCIAS
// ==========================================
const config = require('./config');
const db = require('./database');
const ui = require('./systems/ui');
const extras = require('./systems/sistemasExtras');
const gerImg = require('./systems/geradorImagem');
const lb = require('./systems/layoutBuilder');
require('./systems/webserver'); // Mantém online
// Já inicializado antes // Já inicializado antes

// ==========================================
// 🔌 REGISTRO GLOBAL
// ==========================================
bot.comandos = new Collection();
bot.db = db;
bot.ui = ui;
bot.extras = extras;
bot.gerImg = gerImg;
bot.lb = lb;
bot.SERVIDOR = SERVIDOR_AUTORIZADO;
bot._acoes = {};
require("./systems/acoes_parte1")(bot); require("./systems/acoes_parte2")(bot);
bot._acoes = {}; // Registro central de ações (NUNCA MAIS CONFLITO)
require("./systems/acoes_parte1")(bot); require("./systems/acoes_parte2")(bot);

// ==========================================
// 🔒 SEGURANÇA TOTAL
// ==========================================
function SEGURANCA(i){
  if(!i.guild){ return false; } // Bloqueia DM
  if(i.guild.id !== SERVIDOR_AUTORIZADO){
    console.log(`🛑 BLOQUEADO: ${i.guild.id} | ${i.guild.name}`);
    return false;
  }
  return true;
}

// Sai automaticamente de qualquer servidor que não for o autorizado
bot.on('guildCreate', g => { if(g.id !== SERVIDOR_AUTORIZADO) g.leave().catch(()=>{}) });

// ==========================================
// 📦 CARREGA TODOS COMANDOS
// ==========================================
function carregarComandos(pasta){
  if(!fs.existsSync(pasta)) return;
  fs.readdirSync(pasta).forEach(arq => {
    const cam = path.join(pasta,arq);
    if(fs.statSync(cam).isDirectory()) return carregarComandos(cam);
    if(!arq.endsWith('.js')) return;
    try{
      const c = require(cam);
      if(c?.data?.name){ bot.comandos.set(c.data.name, c); console.log(`✅ CMD: /${c.data.name}`); }
    }catch(e){ console.log(`⚠️ CMD ERRO ${arq}:`,e.message) }
  });
}
carregarComandos(path.join(__dirname,'commands'));
console.log(`📦 ${bot.comandos.size} comandos carregados`);


// ==========================================
// 🎯 TRATAMENTO CENTRAL DE INTERAÇÕES (ÚNICO PONTO!)
// ==========================================

// ==========================================
// 🚀 QUANDO LIGAR
// ==========================================
bot.on('ready', () => {
  // Sai de servidores não autorizados
  bot.guilds.cache.forEach(g => { if(g.id !== SERVIDOR_AUTORIZADO) g.leave().catch(()=>{}) });
  console.log(`\n🟡 ${config.loja.nome.toUpperCase()} ONLINE 🚀`);
  console.log(`🤖 Bot: ${bot.user.tag}`);
  console.log(`📦 Comandos: ${bot.comandos.size}`);
  console.log(`🔒 Servidor: ${SERVIDOR_AUTORIZADO}\n`);
  bot.user.setActivity({name:'🍌 Minions Store',type:3});
});

// 🛡️ ANTI CRASH TOTAL
process.on('unhandledRejection', e => console.log('⚠️ REJ:',e.message));
process.on('uncaughtException', e => console.log('⚠️ EXC:',e.message));

// 🔑 LOGIN
bot.login(config.bot.token).catch(e => console.log('❌ LOGIN:',e.message));

// ==================== SISTEMA QUE FAZ OS BOTÕES FUNCIONAREM ====================

// ==================== CANAL DE VOZ FIXO ====================

const CANAL_VOZ_ID = "1528719886942212186";

const entrarCanal = async () => {

  try{

    const servidor = await bot.guilds.fetch(SERVIDOR_AUTORIZADO);

    const canal = await servidor.channels.fetch(CANAL_VOZ_ID);

    if(canal && canal.type === 2) await canal.join();

    console.log("🔊 CONECTADO NO CANAL DE VOZ!");

  }catch(e){

    console.log("⚠️ Tentando conectar voz novamente em 10s...");

    setTimeout(entrarCanal, 10000);

  }

};

bot.on("ready", entrarCanal);

bot.on("voiceStateUpdate", (antigo, novo) => {

  if(novo.member.id === bot.user.id && !novo.channelId) entrarCanal();

  if(novo.member.id === bot.user.id && novo.channelId !== CANAL_VOZ_ID) entrarCanal();

});


console.log('🟡 MINIONS STORE ONLINE 🚀');

// ==================== TRATADOR 100% RÁPIDO E COMPLETO ====================

// ==================== CANAL DE VOZ FIXO ====================

const CANAL_VOZ_ID = "1528719886942212186";

const entrarCanal = async () => {

  try{

    const servidor = await bot.guilds.fetch(SERVIDOR_AUTORIZADO);

    const canal = await servidor.channels.fetch(CANAL_VOZ_ID);

    if(canal && canal.type === 2) await canal.join();

    console.log("🔊 CONECTADO NO CANAL DE VOZ!");

  }catch(e){

    console.log("⚠️ Tentando conectar voz novamente em 10s...");

    setTimeout(entrarCanal, 10000);

  }

};

bot.on("ready", entrarCanal);

bot.on("voiceStateUpdate", (antigo, novo) => {

  if(novo.member.id === bot.user.id && !novo.channelId) entrarCanal();

  if(novo.member.id === bot.user.id && novo.channelId !== CANAL_VOZ_ID) entrarCanal();

});


console.log('🟡 MINIONS STORE ONLINE 🚀');

// ==================== TRATADOR SEM CONFLITO ====================

// ==================== CANAL DE VOZ FIXO ====================

const CANAL_VOZ_ID = "1528719886942212186";

const entrarCanal = async () => {

  try{

    const servidor = await bot.guilds.fetch(SERVIDOR_AUTORIZADO);

    const canal = await servidor.channels.fetch(CANAL_VOZ_ID);

    if(canal && canal.type === 2) await canal.join();

    console.log("🔊 CONECTADO NO CANAL DE VOZ!");

  }catch(e){

    console.log("⚠️ Tentando conectar voz novamente em 10s...");

    setTimeout(entrarCanal, 10000);

  }

};

bot.on("ready", entrarCanal);

bot.on("voiceStateUpdate", (antigo, novo) => {

  if(novo.member.id === bot.user.id && !novo.channelId) entrarCanal();

  if(novo.member.id === bot.user.id && novo.channelId !== CANAL_VOZ_ID) entrarCanal();

});


console.log('🟡 MINIONS STORE ONLINE 🚀');

// ==================== TRATADOR SEM CONFLITO ====================
bot.on('interactionCreate', async i => {
  // ✅ NÃO usa deferUpdate em comandos, só nos outros
  if (!i.isCommand()) await i.deferUpdate().catch(() => {});

  if(i.guild?.id !== SERVIDOR_AUTORIZADO) {
    await i.reply({content:'❌ Esse bot só funciona no servidor autorizado!',ephemeral:true}).catch(()=>{});
    return;
  }

  if(i.isCommand()) return;

  let id = '';
  const tipo = i.isButton() ? 'btn:' : i.isStringSelectMenu() ? 'menu:' : i.isModalSubmit() ? 'modal:' : '';
  if(!tipo) return;
  id = `${tipo}${i.customId}`;

  let acao = bot._acoes[id];
  if(!acao){
    for(const [chave, fn] of Object.entries(bot._acoes)){
      if(chave.endsWith('_*') && id.startsWith(chave.slice(0,-2))){
        acao = fn;
        break;
      }
    }
  }

  if(acao){
    try{ await acao(i); }
    catch(e){ 
      console.error('❌ ERRO:', id, e); 
      await i.followUp({content:'❌ Erro ao executar ação!',ephemeral:true}).catch(()=>{}); 
    }
  } else {
    await i.followUp({content:'⚠️ Função ainda não implementada!',ephemeral:true}).catch(()=>{});
  }
});
