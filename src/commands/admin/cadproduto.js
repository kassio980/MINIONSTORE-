const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('cadproduto').setDescription('Cadastrar produto')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageProducts || PermissionFlagsBits.Administrator),
  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;
    try {
      await interaction.reply({ content: '✅ /cadproduto funcionando!', ephemeral: true });
    } catch (e) { console.error('cadproduto:', e.message); }
  }
};
