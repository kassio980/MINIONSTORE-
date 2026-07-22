const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('afiliarme').setDescription('Virar afiliado'),
  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;
    try {
      await interaction.reply({ content: '✅ /afiliarme funcionando!', ephemeral: true });
    } catch (e) { console.error('afiliarme:', e.message); }
  }
};
