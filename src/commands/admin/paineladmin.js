const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('paineladmin').setDescription('Painel admin').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(i, { bot, config }) {
    await i.deferReply({ ephemeral: true });
    const e = new EmbedBuilder().setColor(config.cores.principal)
      .setTitle('⚙️ PAINEL ADMINISTRATIVO').setDescription('Gerencie a loja.\n💡 **/configbotoes** personaliza tudo!')
      .addFields(
        {name:'📦 Produtos',value:'Cadastrar/Editar/Excluir',inline:true},
        {name:'🎟️ Cupons',value:'Criar/Desativar',inline:true},
        {name:'💳 Gift',value:'Gerar',inline:true},
        {name:'📊 Vendas',value:'Relatórios',inline:true},
        {name:'👥 Afiliados',value:'Gerenciar',inline:true},
        {name:'⚙️ Config',value:'Ajustes',inline:true}
      );
    // ✅ IDS EXATOS DA SUA ÚLTIMA FOTO
    const l1 = new ActionRowBuilder().addComponents(
      bot.criarBotao('btn:abrircadproduto'),
      bot.criarBotao('btn:abrircriarcupom'),
      bot.criarBotao('btn:abrirrlgift')
    );
    const l2 = new ActionRowBuilder().addComponents(
      bot.criarBotao('btn:relvendas'),
      bot.criarBotao('btn:afil'),
      bot.criarBotao('btn:cfg')
    );
    await i.editReply({ embeds:[e], components:[l1,l2] });
  }
};
