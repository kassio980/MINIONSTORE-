const { SlashCommandBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('meuperfil').setDescription('Meu perfil de afiliado'),
  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;
    try {
      await interaction.reply({ content: '✅ /meuperfil funcionando!', ephemeral: true });
    } catch (e) { console.error('meuperfil:', e.message); }
  }
};
