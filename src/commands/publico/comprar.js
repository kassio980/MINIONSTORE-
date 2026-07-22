const { SlashCommandBuilder } = require('discord.js');
const ui = require('../../systems/ui');
module.exports = {
  data: new SlashCommandBuilder().setName('comprar').setDescription('🛒 Comprar produto').addStringOption(o=>o.setName('id').setDescription('ID do produto').setRequired(true)),
  async executar(i, bot){
    return i.editReply({embeds:[ui.embed('🛒 LOJA','Use o botão LOJA no /inicio para ver todos produtos!','info')]});
  }
};
