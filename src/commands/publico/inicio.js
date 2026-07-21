const { SlashCommandBuilder } = require('discord.js');
const ui = require('../../systems/ui');
module.exports = {
  data: new SlashCommandBuilder().setName('inicio').setDescription('🏪 Painel principal'),
  async executar(i, bot){
    return i.editReply({embeds:[ui.embed('🏪 MINIONS STORE','Tudo em um só lugar! Escolha abaixo:','principal')],components:[
      ui.linhas(
        {id:'loja_abrir',nome:'🛍️ LOJA',estilo:'Success'},
        {id:'abrir_ticket',nome:'💬 SUPORTE',estilo:'Primary'},
        {id:'ver_perfil',nome:'👤 PERFIL',estilo:'Secondary'},
        {id:'btn_admin',nome:'🔧 ADMIN',estilo:'Danger'}
      )
    ]});
  }
};
