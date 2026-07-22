const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('paineladmin').setDescription('Painel admin').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(i, { bot, config }) {
    await i.deferReply({ ephemeral: true });
    const e = new EmbedBuilder().setColor(config.cores.principal)
      .setTitle('⚙️ PAINEL ADMINISTRATIVO').setDescription('Gerencie a loja por aqui. Use **/configbotoes** para personalizar estes botões!')
      .addFields(
        {name:'📦 Produtos',value:'Cadastrar/Editar/Excluir',inline:true},
        {name:'🎟️ Cupons',value:'Criar/Desativar',inline:true},
        {name:'💳 Gift',value:'Gerar cartões',inline:true},
        {name:'📊 Vendas',value:'Relatórios',inline:true},
        {name:'👥 Afiliados',value:'Gerenciar',inline:true},
        {name:'⚙️ Config',value:'Ajustes',inline:true}
      ).setFooter({text:config.loja.nome}).setTimestamp();
    const l1 = new ActionRowBuilder().addComponents(
      bot.criarBotao('btn:abrircadproduto'),
      bot.criarBotao('btn:abrircriarcupom'),
      bot.criarBotao('btn:abrirtgift')
    );
    const l2 = new ActionRowBuilder().addComponents(
      bot.criarBotao('btn:relvendas'),
      bot.criarBotao('btn:afil'),
      bot.criarBotao('btn:cfg')
    );
    await i.editReply({ embeds:[e], components:[l1,l2] });
  }
};
