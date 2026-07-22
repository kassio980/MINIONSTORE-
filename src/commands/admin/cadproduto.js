const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('cadproduto').setDescription('Cadastrar novo produto').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(i) {
    const m = new ModalBuilder().setCustomId('modal:cadproduto').setTitle('➕ NOVO PRODUTO');
    m.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('Nome do Produto').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('preco').setLabel('Preço ex: 29.90').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('est').setLabel('Estoque').setStyle(TextInputStyle.Short).setValue('999').setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('Descrição').setStyle(TextInputStyle.Paragraph).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('arq').setLabel('Link / Arquivo / Entrega').setStyle(TextInputStyle.Short).setRequired(true))
    );
    await i.showModal(m);
  }
};
