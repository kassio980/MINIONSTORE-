const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const BOTOES_DISPONIVEIS = [
  {id:'btn:abrircadproduto',nome:'➕ Cadastrar Produto',cor:ButtonStyle.Success,emoji:'➕'},
  {id:'btn:abrircriarcupom',nome:'🎟️ Criar Cupom',cor:ButtonStyle.Primary,emoji:'🎟️'},
  {id:'btn:abrirtgift',nome:'💳 Gift Card',cor:ButtonStyle.Secondary,emoji:'💳'},
  {id:'btn:relvendas',nome:'📊 Relatório Vendas',cor:ButtonStyle.Primary,emoji:'📊'},
  {id:'btn:afil',nome:'👥 Afiliados',cor:ButtonStyle.Secondary,emoji:'👥'},
  {id:'btn:cfg',nome:'⚙️ Configurações',cor:ButtonStyle.Danger,emoji:'⚙️'},
  {id:'btn:abrirticket',nome:'📩 Abrir Ticket',cor:ButtonStyle.Success,emoji:'📩'},
  {id:'btn:abrirmenucomprar',nome:'🛒 Comprar',cor:ButtonStyle.Success,emoji:'🛒'}
];

const CORES = [
  {nome:'Verde',valor:ButtonStyle.Success},
  {nome:'Azul',valor:ButtonStyle.Primary},
  {nome:'Cinza',valor:ButtonStyle.Secondary},
  {nome:'Vermelho',valor:ButtonStyle.Danger}
];

module.exports = {
  data: new SlashCommandBuilder().setName('configbotoes').setDescription('[ADM] Personalizar TODOS os botões da loja').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(i, { bot }) {
    await i.deferReply({ ephemeral: true });
    const cfg = bot._botoesCfg || {};

    const e = new EmbedBuilder().setColor('#8b5cf6').setTitle('🎨 CONFIGURAR BOTÕES')
      .setDescription('Escolha qual botão quer editar abaixo. Você pode mudar **TEXTO, COR e EMOJI**.')
      .addFields(BOTOES_DISPONIVEIS.map(b => {
        const c = cfg[b.id] || {};
        return {name:`${c.emoji||b.emoji} ${c.nome||b.nome}`,value:`ID: \`${b.id}\`\nCor: ${CORES.find(x=>x.valor===(c.cor||b.cor))?.nome||'Padrão'}`,inline:true};
      }));

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId('menu:editarbotao').setPlaceholder('🎨 Escolha botão para editar')
        .addOptions(BOTOES_DISPONIVEIS.map(b => ({ label:(cfg[b.id]?.nome||b.nome).slice(0,25), description:b.id, value:b.id, emoji:cfg[b.id]?.emoji||b.emoji })))
    );

    const reset = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId('btn:resetarbotoes').setLabel('🔄 Resetar Tudo').setStyle(ButtonStyle.Danger)
    );

    await i.editReply({ embeds:[e], components:[menu, reset] });
  }
};

module.exports.BOTOES_DISPONIVEIS = BOTOES_DISPONIVEIS;
module.exports.CORES = CORES;
