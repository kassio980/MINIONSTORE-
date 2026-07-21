const db = require('../database');

function gerarCodigo(prefixo=''){
  return prefixo + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase();
}

module.exports = {
  gerarCodigo,

  criarCupom({codigo,tipo='percentual',valor=0,usosMax=1,valorMinimo=0}){
    const d = db.pegar();
    const c = {id:Date.now(),codigo:codigo.toUpperCase().trim(),tipo,valor:parseFloat(valor)||0,usosMax:parseInt(usosMax)||1,usosFeitos:0,valorMinimo:parseFloat(valorMinimo)||0,ativo:true,data:new Date().toLocaleString('pt-BR')};
    d.cupons.push(c); db.salvar(d); return c;
  },

  aplicarCupom(codigo, valorTotal, usuarioId){
    const d = db.pegar();
    const c = d.cupons.find(x=>x.codigo===codigo.toUpperCase().trim() && x.ativo);
    if(!c) return {ok:false,msg:'Cupom inválido'};
    if(c.usosFeitos>=c.usosMax) return {ok:false,msg:'Cupom esgotado'};
    if(valorTotal<c.valorMinimo) return {ok:false,msg:`Valor mínimo R$ ${c.valorMinimo.toFixed(2)}`};
    const desc = c.tipo==='fixo' ? Math.min(c.valor,valorTotal) : (valorTotal*c.valor/100);
    return {ok:true,desc,cupom:c};
  },

  usarCupom(id){
    const d = db.pegar(); const c = d.cupons.find(x=>x.id==id);
    if(c){ c.usosFeitos++; if(c.usosFeitos>=c.usosMax) c.ativo=false; db.salvar(d); }
  },

  criarAfiliado(usuarioId,usuarioNome,porcentagem=5){
    const d = db.pegar();
    let a = d.afiliados.find(x=>x.usuarioId===usuarioId);
    if(a) return a;
    a = {id:Date.now(),usuarioId,usuarioNome,codigo:gerarCodigo('AF'),porcentagem:Math.min(parseInt(porcentagem)||5,30),vendas:0,totalGanho:0,data:new Date().toLocaleString('pt-BR')};
    d.afiliados.push(a); db.salvar(d); return a;
  },

  vendaAfiliado(codigo, valorVenda){
    const d = db.pegar(); const a = d.afiliados.find(x=>x.codigo===codigo.toUpperCase().trim());
    if(!a) return null;
    const com = parseFloat((valorVenda*a.porcentagem/100).toFixed(2));
    a.vendas++; a.totalGanho = parseFloat((a.totalGanho+com).toFixed(2)); db.salvar(d);
    return {a,com};
  },

  giftcard(valor){
    const d = db.pegar();
    const g = {id:Date.now(),codigo:gerarCodigo('GC'),valor:parseFloat(valor)||0,usado:false,data:new Date().toLocaleString('pt-BR')};
    d.giftcards.push(g); db.salvar(d); return g;
  },

  addPontos(usuarioId, valorGasto){
    const d = db.pegar();
    let u = d.usuarios.find(x=>x.id===usuarioId);
    if(!u){ u={id:usuarioId,nome:'',pontos:0}; d.usuarios.push(u); }
    const pts = Math.max(1, Math.floor(valorGasto));
    u.pontos = (u.pontos||0) + pts;
    db.salvar(d); return pts;
  },

  ranking(limite=10){
    const d = db.pegar();
    return d.usuarios
      .filter(u=>(u.gastoTotal||0)>0)
      .sort((a,b)=>(b.gastoTotal||0)-(a.gastoTotal||0))
      .slice(0,limite)
      .map(u=>({id:u.id,nome:u.nome,v:parseFloat((u.gastoTotal||0).toFixed(2))}));
  }
};
