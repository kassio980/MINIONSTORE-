const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('inicio').setDescription('Loja oficial'),
  async execute(i, { bot, config }) {
    await i.deferReply();
    const e = new EmbedBuilder().setColor(config.cores.principal).setTitle(`💛 ${config.loja.nome.toUpperCase()} 💛`)
      .setDescription('🇧🇷 A MELHOR LOJA DO BRASIL 🇧🇷\n\n✅ PIX seguro · ⚡ Imediata · 🛡️ Garantia · 💸 Afiliados 10%');
    const b = new ActionRowBuilder().addComponents(bot.criarBotao('btn:abrirmenucomprar'), bot.criarBotao('btn:abrirticket'), bot.criarBotao('btn:regras'));
    const s = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('menu:cats').setPlaceholder('📂 Categoria')
      .addOptions({label:'🎮 Contas',value:'contas'},{label:'💎 Diamantes',value:'diamantes'},{label:'👑 VIPs',value:'vips'},{label:'🎁 Gift',value:'gift'},{label:'📚 Cursos',value:'cursos'}));
    await i.editReply({ embeds:[e], components:[b,s] });
  }
};
