const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('paineladmin').setDescription('Painel admin')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;
    try {
      await interaction.reply({ content: '✅ /paineladmin funcionando!', ephemeral: true });
    } catch (e) { console.error('paineladmin:', e.message); }
  }
};
