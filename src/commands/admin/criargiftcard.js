const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('criargiftcard').setDescription('Criar gift').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(i) {
    const m = new ModalBuilder().setCustomId('modal:giftcard').setTitle('💳 GIFT CARD');
    m.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('valor').setLabel('Valor ex: 50.00').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('qtd').setLabel('Quantidade').setStyle(TextInputStyle.Short).setValue('1').setRequired(true))
    );
    await i.showModal(m);
  }
};
