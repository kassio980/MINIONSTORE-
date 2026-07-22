const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ui = require('../../systems/ui');
module.exports = {
  data: new SlashCommandBuilder().setName('criarcupom').setDescription('🎟️ Criar cupom'),
  async executar(i, bot){
    if(!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.editReply({embeds:[ui.embed('❌ NEGADO','Só administradores','erro')]});
    return i.showModal(ui.modal('modal_criarcupom','NOVO CUPOM',
      {id:'cod',nome:'Código ex: BLACK20',obrigatorio:true},{id:'tipo',nome:'percentual ou fixo',obrigatorio:true},
      {id:'valor',nome:'Valor ex:20',obrigatorio:true},{id:'usos',nome:'Usos máximos',obrigatorio:false}
    ));
  }
};
