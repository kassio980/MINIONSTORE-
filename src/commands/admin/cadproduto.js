const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('cadproduto').setDescription('Cadastrar produto com FOTO/VÍDEO').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(i) {
    const m = new ModalBuilder().setCustomId('modal:cadproduto').setTitle('➕ NOVO PRODUTO');
    m.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('✅ Nome do Produto').setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(60)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('preco').setLabel('💰 Preço ex: 29.90').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('est').setLabel('📦 Estoque').setStyle(TextInputStyle.Short).setValue('999').setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('📝 Descrição').setStyle(TextInputStyle.Paragraph).setRequired(true).setMaxLength(500)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('midia').setLabel('📷 LINK FOTO / VÍDEO (IMGUR)').setStyle(TextInputStyle.Short).setRequired(false).setPlaceholder('https://i.imgur.com/foto.png'))
    );
    await i.showModal(m);
  }
};
