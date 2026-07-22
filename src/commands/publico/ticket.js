const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('ticket').setDescription('Abrir atendimento'),
  async execute(i, { bot, config }) {
    await i.deferReply();
    const e = new EmbedBuilder().setColor(config.cores.info)
      .setTitle('🎧 ATENDIMENTO MINIONS STORE')
      .setDescription('Precisa de ajuda? Abra um ticket!\n\n✅ Dúvidas\n✅ Problemas com pedido\n✅ Reembolso\n✅ Parcerias\n\n**📷 Dentro do ticket você pode enviar FOTOS e VÍDEOS normalmente!**')
      .setFooter({text:config.loja.nome}).setTimestamp();
    const b = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn:abrirticketreal').setLabel('📩 Abrir Ticket').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('btn:regras').setLabel('📜 Regras').setStyle(ButtonStyle.Secondary)
    );
    await i.editReply({ embeds:[e], components:[b] });
  }
};
