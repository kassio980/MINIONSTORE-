const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('criarcupom').setDescription('Criar cupom')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;
    try {
      await interaction.reply({ content: '✅ /criarcupom funcionando!', ephemeral: true });
    } catch (e) { console.error('criarcupom:', e.message); }
  }
};
