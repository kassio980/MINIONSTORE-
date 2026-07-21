const { REST, Routes } = require('discord.js');
const config = require('./config');
const fs = require('fs');
const path = require('path');
const comandos = [];
require('dotenv').config();


function carregar(pasta){
  if(!fs.existsSync(pasta)) return;
  fs.readdirSync(pasta).forEach(item=>{
    const cam = path.join(pasta,item);
    if(fs.statSync(cam).isDirectory()) carregar(cam);
    else if(item.endsWith('.js')) try{
      const c = require(cam);
      if(c?.data) comandos.push(c.data.toJSON());
    }catch(e){console.log(`⚠️ ${item}: ${e.message}`)}
  })
}

carregar(path.join(__dirname, 'commands'));

new REST({version:'10'}).setToken(config.bot.token)
.put(Routes.applicationCommands(config.bot.clientId),{body:comandos})
.then(()=>console.log(`✅ ${comandos.length} COMANDOS REGISTRADOS`))
.catch(e=>console.log(`❌ ERRO: ${e.message}`))
