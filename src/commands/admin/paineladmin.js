const { SlashCommandBuilder } = require('discord.js');
const ui = require('../../systems/ui');
const db = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('paineladmin').setDescription('🔧 Painel ADMIN'),
  async executar(i, bot){
    if(!i.member.permissions.has('Administrator')) return i.editReply({embeds:[ui.embed('❌ NEGADO','Só administradores','erro')]});
    const d = db.pegar();
    const hoje = new Date().toLocaleDateString('pt-BR');
    const vHoje = d.pedidos.filter(p=>p.status==='ENTREGUE ✅' && p.dataEntrega?.includes(hoje));
    const vlr = vHoje.reduce((s,p)=>s+parseFloat(p.valorTotal),0);
    return i.editReply({embeds:[ui.embed('🔧 PAINEL ADMIN',
      `📦 Vendas: **${d.estatisticas.totalVendas}**\n💰 Total: **R$ ${d.estatisticas.valorTotal.toFixed(2)}**\n📅 Hoje: **${vHoje.length}** / **R$ ${vlr.toFixed(2)}**\n👥 Clientes: **${d.usuarios.length}**\n📦 Produtos: **${d.produtos.length}**\n🎟️ Tickets: **${(d.tickets||[]).filter(t=>t.status==='ABERTO').length}**\n${d.config.blackFriday?'🔥 **BLACK FRIDAY ATIVA!**':''}`,
      'principal')],components:[
      ui.linhas({id:'admin_cadprod',nome:'➕ PRODUTO',estilo:'Success'},{id:'admin_criarloja',nome:'🏪 CRIAR LOJA',estilo:'Primary'},{id:'admin_editarbotoes',nome:'🎨 BOTÕES',estilo:'Secondary'},{id:'admin_gerenciarprod',nome:'📋 GERENCIAR',estilo:'Primary'}),
      ui.linhas({id:'admin_criarcupom',nome:'🎟️ CUPOM',estilo:'Success'},{id:'admin_criargift',nome:'🎁 GIFT',estilo:'Primary'},{id:'admin_ranking',nome:'🏆 RANKING',estilo:'Secondary'},{id:'admin_togglebf',nome:(d.config.blackFriday?'🖤 BF OFF':'🔥 BF ON'),estilo:'Danger'}),
      ui.linhas({id:'admin_painelvendas',nome:'📢 PAINEL VENDAS',estilo:'Success'},{id:'admin_painelticket',nome:'🎟️ PAINEL TICKET',estilo:'Primary'},{id:'admin_backup',nome:'💾 BACKUP',estilo:'Secondary'},{id:'inicio_voltar',nome:'🏠 INÍCIO',estilo:'Danger'})
    ]});
  }
};
