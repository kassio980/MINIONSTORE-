require('dotenv').config();
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const TOKEN = process.env.BOT_TOKEN || config.bot.token;
if (!TOKEN || TOKEN.includes('COLOQUE')) { console.error('❌ TOKEN INVÁLIDO'); process.exit(1); }
console.log('✅ Variáveis carregadas');

const SERVIDOR_AUTORIZADO = "1505876225946812440";
const CANAL_VOZ_ID = "1528719886942212186";

const bot = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildVoiceStates],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const db = require('./database');
const ui = require('./systems/ui');
const extras = require('./systems/sistemasExtras');
const gerImg = require('./systems/geradorImagem');
const lb = require('./systems/layoutBuilder');
const pix = require('./systems/pix');
const comprovante = require('./systems/comprovante');
require('./systems/webserver');
console.log('⚠️ Gerador de imagens desativado — bot continua funcionando normalmente');

bot.comandos = new Collection();
bot.db = db; bot.ui = ui; bot.extras = extras; bot.gerImg = gerImg; bot.lb = lb;
bot.pix = pix; bot.comprovante = comprovante; bot.config = config;
bot.SERVIDOR = SERVIDOR_AUTORIZADO;
bot._acoes = {}; bot._pedidos = {}; bot._tickets = {}; bot._produtos = [];
require("./systems/acoes_parte1")(bot);
require("./systems/acoes_parte2")(bot);
console.log('✅ Ações Parte 1 carregadas\n✅ Ações Parte 2 carregadas');

function SEG(i){ if(!i.guild || i.guild.id !== SERVIDOR_AUTORIZADO){ console.log('🛑 BLOQUEADO:',i.guild?.id); return false; } return true; }
bot.on('guildCreate', g => { if(g.id !== SERVIDOR_AUTORIZADO) g.leave().catch(()=>{}) });

function carregar(p){
  if(!fs.existsSync(p)) return;
  fs.readdirSync(p).forEach(a => {
    const c = path.join(p,a);
    if(fs.statSync(c).isDirectory()) return carregar(c);
    if(!a.endsWith('.js')) return;
    try{ const x = require(c); if(x?.data?.name){ bot.comandos.set(x.data.name, x); console.log(`✅ CMD: /${x.data.name}`); } }
    catch(e){ console.log(`❌ CMD ERRO ${a}:`, e.message) }
  });
}
carregar(path.join(__dirname,'commands'));
console.log(`📦 TOTAL COMANDOS DISPONIVEIS: ${bot.comandos.size}`);

let voz = null;
const entrarVoz = async () => {
  try{
    const g = await bot.guilds.fetch(SERVIDOR_AUTORIZADO);
    const ch = await g.channels.fetch(CANAL_VOZ_ID);
    voz = joinVoiceChannel({ channelId:ch.id, guildId:g.id, adapterCreator:g.voiceAdapterCreator });
    voz.on(VoiceConnectionStatus.Ready, () => console.log('🔊 CONECTADO NO CANAL DE VOZ!'));
    voz.on(VoiceConnectionStatus.Disconnected, async () => { try{ await Promise.race([entersState(voz,VoiceConnectionStatus.Signalling,4000),entersState(voz,VoiceConnectionStatus.Connecting,4000)]) }catch{ voz?.destroy(); setTimeout(entrarVoz,3000) } });
  }catch(e){ console.log('⚠️ Voz:',e.message); setTimeout(entrarVoz,10000) }
};
bot.on("voiceStateUpdate", (a,n) => { if(n.member.id===bot.user.id && (!n.channelId||n.channelId!==CANAL_VOZ_ID)) setTimeout(entrarVoz,1500) });

bot.on('clientReady', () => {
  bot.guilds.cache.forEach(g => { if(g.id !== SERVIDOR_AUTORIZADO) g.leave().catch(()=>{}) });
  console.log(`\n🟡 ${config.loja.nome.toUpperCase()} ONLINE 🚀\n🤖 Bot: ${bot.user.tag}\n📦 Comandos prontos: ${bot.comandos.size}\n🔒 Servidor: ${SERVIDOR_AUTORIZADO}\n`);
  bot.user.setActivity({name:'🍌 Minions Store',type:3});
  entrarVoz();
});

process.on('unhandledRejection', e => console.log('⚠️ ERRO:', e.message));
process.on('uncaughtException', e => console.log('⚠️ FATAL:', e.message));

bot.on('interactionCreate', async i => {
  if(!SEG(i)){ if(!i.replied && !i.deferred) await i.reply({content:'❌ Só no servidor autorizado',ephemeral:true}).catch(()=>{}); return; }

  if(i.isChatInputCommand()){
    const cmd = bot.comandos.get(i.commandName);
    if(!cmd) return i.reply({content:`❌ /${i.commandName} não existe`,ephemeral:true}).catch(()=>{});
    try{ await cmd.execute(i, { bot, config, db, ui, extras, gerImg, lb, pix, comprovante }); }
    catch(e){
      console.error(`❌ /${i.commandName}:`, e);
      if(!i.replied && !i.deferred) await i.reply({content:`❌ Erro: ${e.message}`,ephemeral:true}).catch(()=>{});
      else if(i.deferred) await i.editReply({content:`❌ Erro: ${e.message}`}).catch(()=>{});
    }
    return;
  }

  if(i.isModalSubmit()){
    const id = `modal:${i.customId}`;
    console.log('📨 MODAL:', id);
    const fn = bot._acoes[id];
    if(fn){ try{ await fn(i); }catch(e){ console.error('❌ MODAL:',e); await i.reply({content:`❌ Erro: ${e.message}`,ephemeral:true}).catch(()=>{}) } }
    else await i.reply({content:`⚠️ Modal sem ação: ${id}`,ephemeral:true}).catch(()=>{});
    return;
  }

  let tipo = i.isButton() ? 'btn:' : i.isStringSelectMenu() ? 'menu:' : null;
  if(!tipo) return;
  const idBusca = `${tipo}${i.customId}`;
  console.log('🎯 INTERAÇÃO:', idBusca);

  let fn = bot._acoes[idBusca];
  if(!fn){
    for(const [chave, funcao] of Object.entries(bot._acoes)){
      if(chave.endsWith('_*')){
        const prefixo = chave.slice(0,-2);
        if(idBusca.startsWith(prefixo)){ fn = funcao; console.log('   ✅ Curinga:', chave); break; }
      }
    }
  }

  if(!fn){
    console.log('   ❌ SEM AÇÃO:', idBusca);
    if(!i.replied && !i.deferred) await i.reply({content:`⚠️ Botão sem ação: ${i.customId}`,ephemeral:true}).catch(()=>{});
    return;
  }

  if(!i.replied && !i.deferred) await i.deferUpdate().catch(()=>{});
  try{ await fn(i); }catch(e){ console.error('❌ AÇÃO:',idBusca,e); await i.followUp({content:`❌ Erro: ${e.message}`,ephemeral:true}).catch(()=>{}) }
});

bot.login(TOKEN).then(()=>console.log('🔑 TOKEN ACEITO!')).catch(e=>{console.error('❌ LOGIN:',e.message);process.exit(1)});
