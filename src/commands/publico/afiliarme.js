const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('afiliarme').setDescription('Virar afiliado e ganhar dinheiro'),
  async execute(i, { bot, config }) {
    await i.deferReply({ ephemeral: true });
    const link = `https://${config.loja.dominio}/ref/${i.user.id}`;
    const e = new EmbedBuilder().setColor(config.cores.sucesso)
      .setTitle('💸 SISTEMA DE AFILIADOS').setDescription(`Ganhe **10% DE COMISSÃO** em CADA venda indicada por você!\n\n🔗 **Seu link exclusivo:**\n${link}`)
      .addFields(
        {name:'💰 Comissão',value:'10% por venda',inline:true},
        {name:'⚡ Saque',value:'A partir de R$ 20',inline:true},
        {name:'💳 Pagamento',value:'PIX em até 24h',inline:true}
      ).setFooter({text:`Afiliado: ${i.user.tag}`}).setTimestamp();
    const b = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn:ganhos').setLabel('💵 Meus Ganhos').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('btn:saque').setLabel('🏦 Solicitar Saque').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setURL(link).setLabel('🔗 Meu Link').setStyle(ButtonStyle.Link));
    await i.editReply({ embeds:[e], components:[b] });
  }
};
