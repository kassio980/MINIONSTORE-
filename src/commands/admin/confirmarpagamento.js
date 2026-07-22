const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ui = require('../../systems/ui');
module.exports = {
  data: new SlashCommandBuilder().setName('confirmarpagamento').setDescription('✅ Confirmar pagamento').addStringOption(o=>o.setName('pedido').setDescription('ID do pedido').setRequired(true)),
  async executar(i, bot){
    if(!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.editReply({embeds:[ui.embed('❌ NEGADO','Só administradores','erro')]});
    return i.editReply({embeds:[ui.embed('✅ SISTEMA','Use os botões do painel de vendas!','info')]});
  }
};
