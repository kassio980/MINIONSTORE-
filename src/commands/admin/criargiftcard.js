const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('criargiftcard')
    .setDescription('Comando do sistema'),

  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;

    // === SEU CÓDIGO ORIGINAL ABAIXO ===
const { SlashCommandBuilder } = require('discord.js');
const ui = require('../../systems/ui');
  data: new SlashCommandBuilder().setName('criargiftcard').setDescription('🎁 Criar giftcard').addNumberOption(o=>o.setName('valor').setDescription('Valor R$').setRequired(true)),
  async executar(i, bot){
    if(!i.member.permissions.has('Administrator')) return i.editReply({embeds:[ui.embed('❌ NEGADO','Só admins','erro')]});
    const g = bot.extras.giftcard(i.options.getNumber('valor'));
    return i.editReply({embeds:[ui.embed('🎁 GIFTCARD',`Código: \`${g.codigo}\`\nValor: **R$ ${g.valor.toFixed(2)}**`,'sucesso')]});
  }
};
  }
};
