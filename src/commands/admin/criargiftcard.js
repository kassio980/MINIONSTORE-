const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('criargiftcard').setDescription('Criar gift card')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;
    try {
      await interaction.reply({ content: '✅ /criargiftcard funcionando!', ephemeral: true });
    } catch (e) { console.error('criargiftcard:', e.message); }
  }
};
