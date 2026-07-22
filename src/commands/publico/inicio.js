const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('inicio').setDescription('Início da loja'),
  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;
    try {
      await interaction.reply({ content: '✅ /inicio funcionando!', ephemeral: true });
    } catch (e) { console.error('inicio:', e.message); }
  }
};
