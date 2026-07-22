const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const IDS = [
  {id:'btn:abrircadproduto',nome:'➕ Cadastrar Produto'},
  {id:'btn:abrircriarcupom',nome:'🎟️ Criar Cupom'},
  {id:'btn:abrirlgift',nome:'💳 Gift Card'},
  {id:'btn:relvendas',nome:'📊 Relatório Vendas'},
  {id:'btn:afil',nome:'👥 Afiliados'},
  {id:'btn:cfg',nome:'⚙️ Configurações'},
  {id:'btn:abrirticket',nome:'📩 Abrir Ticket'},
  {id:'btn:abrirmenucomprar',nome:'🛒 Comprar'}
];
module.exports = {
  data: new SlashCommandBuilder().setName('configbotoes').setDescription('[ADM] Personalizar botões').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(i, { bot }) {
    await i.deferReply({ ephemeral: true });
    const cfg = bot._botoesCfg || {};
    const e = new EmbedBuilder().setColor('#8b5cf6').setTitle('🎨 PERSONALIZAR BOTÕES')
      .setDescription('Escolha qual botão editar. Muda **TEXTO, COR e EMOJI**.')
      .addFields(IDS.map(b => ({name:(cfg[b.id]?.emoji||'')+' '+(cfg[b.id]?.nome||b.nome),value:`\`${b.id}\``,inline:true})));
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId('menu:editarbotao').setPlaceholder('🎨 Escolha o botão')
        .addOptions(IDS.map(b => ({label:(cfg[b.id]?.nome||b.nome).slice(0,25),description:b.id,value:b.id})))
    );
    const reset = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn:resetarbotoes').setLabel('🔄 Resetar Tudo').setStyle(ButtonStyle.Danger)
    );
    await i.editReply({ embeds:[e], components:[menu, reset] });
  }
};
