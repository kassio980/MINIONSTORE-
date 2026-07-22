const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('meuperfil').setDescription('Meu perfil na loja'),
  async execute(i, { bot, config, db }) {
    await i.deferReply({ ephemeral: true });
    const u = i.user;
    const p = (await db?.getPerfil?.(u.id)) || { compras:0, gasto:0, nivel:1, afiliado:false };
    const e = new EmbedBuilder().setColor(config.cores.info)
      .setAuthor({name:u.tag,iconURL:u.displayAvatarURL()}).setTitle('👤 MEU PERFIL')
      .addFields(
        {name:'🆔 ID',value:`\`${u.id}\``,inline:true},
        {name:'⭐ Nível',value:`${p.nivel}`,inline:true},
        {name:'🛒 Compras',value:`${p.compras}`,inline:true},
        {name:'💸 Total Gasto',value:`R$ ${parseFloat(p.gasto||0).toFixed(2)}`,inline:true},
        {name:'💸 Afiliado',value:p.afiliado?'✅ Sim':'❌ Não',inline:true}
      ).setThumbnail(u.displayAvatarURL()).setTimestamp();
    const b = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn:pedidos').setLabel('📦 Pedidos').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('btn:cupons').setLabel('🎟️ Cupons').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('btn:ind').setLabel('👥 Indicações').setStyle(ButtonStyle.Secondary));
    await i.editReply({ embeds:[e], components:[b] });
  }
};
