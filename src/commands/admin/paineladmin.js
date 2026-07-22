const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('paineladmin').setDescription('Painel administrativo completo').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(i, { bot, config }) {
    await i.deferReply({ ephemeral: true });
    const e = new EmbedBuilder().setColor(config.cores.principal)
      .setTitle('⚙️ PAINEL ADMINISTRATIVO').setDescription('Gerencie TODA a loja por aqui')
      .addFields(
        {name:'📦 Produtos',value:'Cadastrar / Editar / Excluir',inline:true},
        {name:'🎟️ Cupons',value:'Criar / Desativar',inline:true},
        {name:'💳 Gift Cards',value:'Gerar cartões',inline:true},
        {name:'📊 Vendas',value:'Relatórios completos',inline:true},
        {name:'👥 Afiliados',value:'Gerenciar afiliados',inline:true},
        {name:'⚙️ Config',value:'Ajustes do sistema',inline:true}
      ).setFooter({text:config.loja.nome,iconURL:bot.user.displayAvatarURL()}).setTimestamp();
    const l1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn:cadproduto').setLabel('➕ Cadastrar Produto').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('btn:criarcupom').setLabel('🎟️ Criar Cupom').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('btn:criargift').setLabel('💳 Gift Card').setStyle(ButtonStyle.Secondary));
    const l2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn:relvendas').setLabel('📊 Relatório Vendas').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('btn:afil').setLabel('👥 Afiliados').setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId('btn:cfg').setLabel('⚙️ Configurações').setStyle(ButtonStyle.Danger));
    await i.editReply({ embeds:[e], components:[l1,l2] });
  }
};
