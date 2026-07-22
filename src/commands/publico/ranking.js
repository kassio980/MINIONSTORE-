const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('ranking').setDescription('Ranking de afiliados'),
  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;
    try {
      await interaction.reply({ content: '✅ /ranking funcionando!', ephemeral: true });
    } catch (e) { console.error('ranking:', e.message); }
  }
};
