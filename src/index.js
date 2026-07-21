// ==============================================
// ✅ 1º CARREGA VARIÁVEIS ANTES DE TUDO
// ==============================================
require('dotenv').config();
const { joinChannel } = require('@discordjs/voice');
bot.voice = { joinChannel };
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

// ==============================================
// 🔍 MOSTRA TUDO O QUE FOI CARREGADO
// ==============================================
console.log('📋 Todas variáveis carregadas:');
console.log('- BOT_TOKEN:', process.env.BOT_TOKEN ? '✅ ENCONTRADA' : '❌ NÃO EXISTE');
console.log('- Todas as chaves:', Object.keys(process.env).filter(k => k.includes('BOT') || k.includes('TOKEN')));

// ==============================================
// ✅ 2º CARREGA CONFIGURAÇÕES
// ==============================================
const config = require('./config');

// ==============================================
// ✅ 3º VALIDAÇÃO OBRIGATÓRIA
// ==============================================
const tokenReal = process.env.BOT_TOKEN || config.bot.token;
if (!tokenReal || tokenReal === '' || tokenReal === 'COLOQUE_AQUI_SEU_TOKEN') {
  console.error('❌ ERRO CRÍTICO: Nenhum token encontrado!');
  console.error('🔑 Verifique no arquivo .env se está escrito EXATAMENTE:');
  console.error('BOT_TOKEN=seu_token_completo_sem_aspas_sem_espaco');
  process.exit(1);
}
console.log('✅ Variáveis de ambiente carregadas corretamente');


// ==============================================
// 🔒 VALORES FIXOS DECLARADOS APENAS 1 VEZ
// ==============================================
const SERVIDOR_AUTORIZADO = "1505876225946812440";
const CANAL_VOZ_ID = "1528719886942212186";

// ==============================================
// 🤖 CRIA O BOT
// ==============================================
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

// ==============================================
// 📦 CARREGA DEMAIS SISTEMAS
// ==============================================
const db = require('./database');
const ui = require('./systems/ui');
const extras = require('./systems/sistemasExtras');
const gerImg = require('./systems/geradorImagem');
const lb = require('./systems/layoutBuilder');
require('./systems/webserver'); // Mantém online

// ==============================================
// 🔌 REGISTRO GLOBAL
// ==============================================
bot.comandos = new Collection();
bot.db = db;
bot.ui = ui;
bot.extras = extras;
bot.gerImg = gerImg;
bot.lb = lb;
bot.SERVIDOR = SERVIDOR_AUTORIZADO;
bot._acoes = {};
require("./systems/acoes_parte1")(bot);
require("./systems/acoes_parte2")(bot);

// ==============================================
// 🔒 SEGURANÇA TOTAL
// ==============================================
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

// ==============================================
// 📦 CARREGA TODOS COMANDOS
// ==============================================
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

// ==============================================
// 🔊 CANAL DE VOZ FIXO - CORRIGIDO AUTOMATICAMENTE
// ==============================================
const entrarCanal = async () => {
  try{
    const servidor = await bot.guilds.fetch(SERVIDOR_AUTORIZADO);
    const canal = await servidor.channels.fetch(CANAL_VOZ_ID);

    // Verifica se existe e é canal de voz
    if(!canal || canal.type !== 2) {
      console.log("⚠️ Canal de voz não encontrado ou tipo inválido!");
      setTimeout(entrarCanal, 10000);
      return;
    }

    // Forma correta de conectar no canal
    await bot.voice.joinChannel(canal);
    console.log("🔊 CONECTADO COM SUCESSO NO CANAL DE VOZ!");
  }catch(e){
    console.log("⚠️ Tentando conectar voz novamente em 10s... Motivo:", e.message);
    setTimeout(entrarCanal, 10000);
  }
};

// ==============================================
// 🚀 QUANDO LIGAR - SEM AVISO DEPRECIADO
// ==============================================
bot.on('clientReady', () => {
  // Sai de servidores não autorizados
  bot.guilds.cache.forEach(g => { if(g.id !== SERVIDOR_AUTORIZADO) g.leave().catch(()=>{}) });
  console.log(`\n🟡 ${config.loja.nome.toUpperCase()} ONLINE 🚀`);
  console.log(`🤖 Bot: ${bot.user.tag}`);
  console.log(`📦 Comandos: ${bot.comandos.size}`);
  console.log(`🔒 Servidor: ${SERVIDOR_AUTORIZADO}\n`);
  bot.user.setActivity({name:'🍌 Minions Store',type:3});
  entrarCanal();
});

bot.on("voiceStateUpdate", (antigo, novo) => {
  if(novo.member.id === bot.user.id && !novo.channelId) entrarCanal();
  if(novo.member.id === bot.user.id && novo.channelId !== CANAL_VOZ_ID) entrarCanal();
});


// ==============================================
// 🛡️ ANTI CRASH MOSTRA TODOS ERROS
// ==============================================
process.on('unhandledRejection', e => {
  console.log('⚠️ ERRO PROMESSA:', e);
  console.log('📄 RASTRO:', e.stack);
});
process.on('uncaughtException', e => {
  console.log('⚠️ ERRO FATAL:', e);
  console.log('📄 RASTRO:', e.stack);
});

// ==============================================
// 🎯 TRATADOR DE INTERAÇÕES COMPLETO
// ==============================================
bot.on('interactionCreate', async i => {
  // Verifica permissão de servidor primeiro
  if(i.guild?.id !== SERVIDOR_AUTORIZADO) {
    await i.reply({content:'❌ Esse bot só funciona no servidor autorizado!',ephemeral:true}).catch(()=>{});
    return;
  }

  // Trata comandos de barra
  if(i.isChatInputCommand()){
    const comando = bot.comandos.get(i.commandName);
    if(!comando) return await i.reply({content:'❌ Comando não encontrado!',ephemeral:true}).catch(()=>{});
    try{ await comando.execute(i); }
    catch(e){
      console.error('❌ ERRO NO COMANDO:', e);
      await i.reply({content:'❌ Erro ao executar esse comando!',ephemeral:true}).catch(()=>{});
    }
    return;
  }

  // Apenas botões/menus/modais: confirma recebimento
  await i.deferUpdate().catch(() => {});

  let tipo = '';
  if(i.isButton()) tipo = 'btn:';
  else if(i.isStringSelectMenu()) tipo = 'menu:';
  else if(i.isModalSubmit()) tipo = 'modal:';
  else return;

  const id = `${tipo}${i.customId}`;
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
      console.error('❌ ERRO NA AÇÃO:', id, e);
      await i.followUp({content:'❌ Erro ao executar ação!',ephemeral:true}).catch(()=>{});
    }
  } else {
    await i.followUp({content:'⚠️ Função ainda não implementada!',ephemeral:true}).catch(()=>{});
  }
});

// ==============================================
// 🔑 LOGIN FINAL
// ==============================================
bot.login(config.bot.token)
.then(() => console.log('🔑 TOKEN ACEITO, CONEXÃO INICIADA COM SUCESSO'))
.catch(e => console.log('❌ FALHA NO LOGIN:', e.message, '\n', e.stack));







