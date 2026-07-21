// 🛡️ MODO SEGURO: Se não achar biblioteca, retorna vazio sem travar
let DISPONIVEL = false;
let canvas = null;

try {
  canvas = require('@napi-rs/canvas');
  DISPONIVEL = true;
} catch {
  console.log('⚠️ Aviso: Gerador de imagens desativado — bot continua funcionando normalmente');
}

module.exports = {
  async cardProduto(p){
    if(!DISPONIVEL || !p) return null;
    try{
      const { createCanvas } = canvas;
      const w=800, h=400;
      const c = createCanvas(w,h);
      const ctx = c.getContext('2d');
      const grad = ctx.createLinearGradient(0,0,w,h);
      grad.addColorStop(0,'#1a1a2e'); grad.addColorStop(1,'#16213e');
      ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='#FFD700'; ctx.lineWidth=4; ctx.strokeRect(20,20,w-40,h-40);
      ctx.fillStyle='#FFD700'; ctx.font='bold 44px Arial Black'; ctx.textAlign='center';
      ctx.fillText(String(p.nome||'Produto').slice(0,28).toUpperCase(), w/2, 110);
      ctx.fillStyle='#00FF00'; ctx.font='bold 90px Arial Black';
      ctx.fillText(`R$ ${parseFloat(p.preco||0).toFixed(2)}`, w/2, 240);
      ctx.fillStyle='#FFFFFF'; ctx.font='bold 26px Arial';
      ctx.fillText(`⭐ ${p.avaliacao||'5.0'}    📦 ESTOQUE: ${p.estoque||0}    🛒 ${p.vendas||0} VENDAS`, w/2, 310);
      ctx.fillStyle='#AAAAAA'; ctx.font='20px Arial';
      ctx.fillText(`🛡️ ${p.garantia||'30 DIAS'}    🚚 ${p.frete||'FRETE GRÁTIS'}`, w/2, 360);
      return c.toBuffer('image/png');
    }catch{ return null; }
  },

  async comprovanteCompra(pedido, cliente, produto){
    if(!DISPONIVEL || !pedido) return null;
    try{
      const { createCanvas } = canvas;
      const w=900, h=600;
      const c = createCanvas(w,h);
      const ctx = c.getContext('2d');
      const grad = ctx.createLinearGradient(0,0,w,h);
      grad.addColorStop(0,'#0f2027'); grad.addColorStop(0.5,'#203a43'); grad.addColorStop(1,'#2c5364');
      ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
      ctx.fillStyle='#FFD700'; ctx.font='bold 50px Arial Black'; ctx.textAlign='center';
      ctx.fillText('✅ PAGAMENTO CONFIRMADO', w/2, 80);
      ctx.fillStyle='#FFFFFF'; ctx.font='22px Arial';
      ctx.fillText('MINIONS STORE • A MELHOR DO BRASIL 🇧🇷', w/2, 120);
      ctx.strokeStyle='#FFD700'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(60,150); ctx.lineTo(w-60,150); ctx.stroke();
      ctx.textAlign='left';
      ctx.fillStyle='#AAAAAA'; ctx.font='bold 22px Arial';
      const dados = [
        ['🆔 PEDIDO', `#${pedido.id}`],
        ['📦 PRODUTO', String(produto?.nome||pedido.produto).slice(0,35)],
        ['👤 CLIENTE', String(cliente?.nome||pedido.usuarioNome).slice(0,30)],
        ['🎖️ NÍVEL', String(cliente?.nivelNome||'Cliente')],
        ['💸 VALOR', `R$ ${parseFloat(pedido.valorTotal||0).toFixed(2)}`],
        ['📅 DATA', pedido.dataPagamento||new Date().toLocaleString('pt-BR')],
        ['🪙 PONTOS', `+${Math.max(1,Math.floor(parseFloat(pedido.valorTotal||0)))} PTS`],
        ['🎟️ CUPOM', pedido.cupomUsado||'Nenhum'],
        ['🤝 AFILIADO', pedido.codigoAfiliado||'Nenhum']
      ];
      let y=200;
      dados.forEach(([k,v])=>{
        ctx.fillStyle='#AAAAAA'; ctx.fillText(k, 80, y);
        ctx.fillStyle='#FFFFFF'; ctx.font='bold 22px Arial'; ctx.fillText(String(v), 420, y);
        y += 38;
      });
      ctx.textAlign='center';
      ctx.fillStyle='#FFD700'; ctx.font='bold 28px Arial Black';
      ctx.fillText('💛 OBRIGADO POR COMPRAR! 💛', w/2, 560);
      return c.toBuffer('image/png');
    }catch{ return null; }
  }
};
