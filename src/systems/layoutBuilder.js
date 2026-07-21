const db = require('../database');

const TEMPLATES = {
  padrao: (p) => `📝 **Descrição:**\n${p.descricao||''}\n\n💸 **Preço:** **R$ ${parseFloat(p.preco).toFixed(2)}**\n📦 **Estoque:** ${p.estoque}\n⭐ **Avaliação:** ${p.avaliacao||'5.0'} (${p.totalAvaliacoes||0})\n🛡️ **Garantia:** ${p.garantia||'30 dias'}\n🚚 **Frete:** ${p.frete||'Grátis'}`,
  premium: (p) => `✨ **PRODUTO PREMIUM** ✨\n\n📦 **${p.nome}**\n\n${p.descricao||''}\n\n💎 **Valor:** **R$ ${parseFloat(p.preco).toFixed(2)}**\n🔥 **Apenas ${p.estoque} unidades em estoque!**\n🎁 **Garantia estendida:** ${p.garantia||'90 dias'}\n⚡ **Entrega prioritária**\n⭐ **+${p.vendas||0} clientes satisfeitos**`,
  promocao: (p) => `🔥 **PROMOÇÃO RELÂMPAGO!** 🔥\n\n📦 **${p.nome}**\n\n${p.descricao||''}\n\n❌ DE: **R$ ${parseFloat(p.precoOriginal||p.preco).toFixed(2)}**\n✅ POR: **R$ ${parseFloat(p.preco).toFixed(2)}**\n💸 **ECONOMIA: R$ ${Math.max(0,parseFloat(p.precoOriginal||p.preco)-parseFloat(p.preco)).toFixed(2)}**\n⏳ **Válido enquanto durar o estoque!**\n📦 **Restam apenas ${p.estoque} unidades!**`
};

module.exports = {
  TEMPLATES,

  criarLayout(produtoId, template='padrao'){
    const d = db.pegar();
    if(!d.layouts) d.layouts=[];
    const l = {id:Date.now(),produtoId,template,personalizado:null,publicado:true,data:new Date().toLocaleString('pt-BR')};
    d.layouts.push(l); db.salvar(d); return l;
  },

  async renderizar(layout, produto){
    if(layout.personalizado) return layout.personalizado;
    const fn = TEMPLATES[layout.template] || TEMPLATES.padrao;
    return fn(produto);
  },

  listarTemplates(){ return Object.keys(TEMPLATES) }
};
