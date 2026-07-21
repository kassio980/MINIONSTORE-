const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('criarcupom')
    .setDescription('Comando do sistema'),

  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;

    // === SEU CÓDIGO ORIGINAL ABAIXO ===
const { SlashCommandBuilder } = require('discord.js');
const ui = require('../../systems/ui');
  data: new SlashCommandBuilder().setName('criarcupom').setDescription('🎟️ Criar cupom'),
  async executar(i, bot){
    if(!i.member.permissions.has('Administrator')) return i.editReply({embeds:[ui.embed('❌ NEGADO','Só admins','erro')]});
    return i.showModal(ui.modal('modal_criarcupom','NOVO CUPOM',
      {id:'cod',nome:'Código ex: BLACK20',obrigatorio:true},{id:'tipo',nome:'percentual ou fixo',obrigatorio:true},
      {id:'valor',nome:'Valor ex:20',obrigatorio:true},{id:'usos',nome:'Usos máximos',obrigatorio:false}
    ));
  }
};
  }
};
