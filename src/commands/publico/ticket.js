const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('ticket').setDescription('Atendimento'),
  async execute(i, { bot, config }) {
    await i.deferReply();
    const e = new EmbedBuilder().setColor(config.cores.info).setTitle('🎧 ATENDIMENTO')
      .setDescription('Precisa de ajuda? Abra um ticket!\n\n📷 Pode enviar FOTOS e VÍDEOS dentro do ticket.');
    const b = new ActionRowBuilder().addComponents(
      bot.criarBotao('btn:abrirticket'),
      bot.criarBotao('btn:regras')
    );
    await i.editReply({ embeds:[e], components:[b] });
  }
};
