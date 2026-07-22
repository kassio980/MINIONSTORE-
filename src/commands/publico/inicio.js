const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('inicio').setDescription('Abrir loja oficial'),
  async execute(i, { bot, config }) {
    await i.deferReply();
    const e = new EmbedBuilder().setColor(config.cores.principal)
      .setTitle(`💛 ${config.loja.nome.toUpperCase()} 💛`).setURL(`https://${config.loja.dominio}`)
      .setDescription('🇧🇷 **A MELHOR LOJA DO BRASIL** 🇧🇷\n\n✅ PIX 100% seguro\n⚡ Entrega IMEDIATA\n🛡️ Garantia total\n💸 Afiliados: 10% de comissão\n🎧 Atendimento via ticket')
      .addFields(
        {name:'⚡ Entrega',value:'Imediata',inline:true},
        {name:'🛡️ Garantia',value:String(config.loja.garantiaPadrao||'30 dias'),inline:true},
        {name:'🚚 Frete',value:String(config.loja.fretePadrao||'Grátis'),inline:true}
      ).setFooter({text:config.loja.nome,iconURL:bot.user.displayAvatarURL()}).setTimestamp();
    const b = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn:abrirmenucomprar').setLabel('🛒 Comprar').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('btn:pedidos').setLabel('📦 Pedidos').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('btn:afiliar').setLabel('💸 Afiliar').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('btn:abrirticketreal').setLabel('🎧 Atendimento').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('btn:ajuda').setLabel('❓ Ajuda').setStyle(ButtonStyle.Danger)
    );
    const s = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('menu:cats').setPlaceholder('📂 Ver por categoria')
      .addOptions({label:'🎮 Contas',value:'contas'},{label:'💎 Diamantes',value:'diamantes'},{label:'👑 VIPs',value:'vips'},{label:'🎁 Gift Cards',value:'gift'},{label:'📚 Cursos',value:'cursos'}));
    await i.editReply({ embeds:[e], components:[b,s] });
  }
};
