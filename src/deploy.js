require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const comandos = [];
const pastaComandos = path.join(__dirname, 'commands');

function lerPasta(pasta){
  if(!fs.existsSync(pasta)) return;
  fs.readdirSync(pasta).forEach(arq => {
    const cam = path.join(pasta, arq);
    if(fs.statSync(cam).isDirectory()) return lerPasta(cam);
    if(!arq.endsWith('.js')) return;
    try{
      const cmd = require(cam);
      if(cmd?.data) comandos.push(cmd.data.toJSON());
    }catch(e){ console.log(`⚠️ Ignorado ${arq}: ${e.message}`) }
  });
}
lerPasta(pastaComandos);

const rest = new REST({version:'10'}).setToken(process.env.BOT_TOKEN || config.bot.token);

(async () => {
  try{
    console.log(`🔄 Atualizando ${comandos.length} comandos...`);
    await rest.put(
      Routes.applicationGuildCommands(config.bot.clientId, '1505876225946812440'),
      {body: comandos}
    );
    console.log(`✅ ${comandos.length} COMANDOS REGISTRADOS COM SUCESSO`);
  }catch(e){
    console.error('❌ ERRO AO REGISTRAR:', e.message);
  }
})();
