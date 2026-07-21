const db = require('../database');
const ui = require('./ui');
const extras = require('./sistemasExtras');

exports.modal_cadprod = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const d = db.pegar();
  const preco = parseFloat(i.fields.getTextInputValue('preco').replace(',','.'))||0;
  const estoque = parseInt(i.fields.getTextInputValue('estoque')||'9999');
  const bf = d.config.blackFriday ? 0.8 : 1;
  const p = {
    id:Date.now(),
    nome:i.fields.getTextInputValue('nome').slice(0,90),
    descricao:i.fields.getTextInputValue('desc'),
    preco:parseFloat((preco*bf).toFixed(2)),
    precoOriginal:preco,
    estoque:estoque>0?estoque:9999,
    imagem:i.fields.getTextInputValue('imagem')||null,
    video:null,
    avaliacao:5.0,
    totalAvaliacoes:0,
    vendas:0,
    garantia:'30 dias',
    frete:'Grátis',
    beneficios:['Qualidade garantida','Suporte 24h','Entrega rápida'],
    publicado:true,
    data:new Date().toLocaleString('pt-BR')
  };
  d.produtos.push(p);
  db.salvar(d);
  
  await i.followUp({embeds:[ui.embed('✅ PRODUTO CADASTRADO!',
    `📦 **${p.nome}**\n💸 **R$ ${p.preco.toFixed(2)}**${d.config.blackFriday?` (-20% BF)`:''}\n📦 Estoque: **${p.estoque}**\n🆔 ID: \`${p.id}\``,
    'sucesso',p.imagem)],ephemeral:true}).catch(()=>{});
  return true;
};

exports.modal_criarcupom = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const c = extras.criarCupom({
    codigo:i.fields.getTextInputValue('cod').toUpperCase().trim(),
    tipo:i.fields.getTextInputValue('tipo').toLowerCase().trim()==='fixo'?'fixo':'percentual',
    valor:parseFloat(i.fields.getTextInputValue('valor').replace(',','.'))||0,
    usosMax:parseInt(i.fields.getTextInputValue('usos')||'1')
  });
  
  await i.followUp({embeds:[ui.embed('🎟️ CUPOM CRIADO!',
    `**Código:** \`${c.codigo}\`\n**Tipo:** ${c.tipo==='percentual'?`${c.valor}%`:`R$ ${c.valor.toFixed(2)}`}\n**Usos:** ${c.usosMax}`,
    'sucesso')],ephemeral:true}).catch(()=>{});
  return true;
};

exports.modal_gift = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const v = parseFloat(i.fields.getTextInputValue('valor').replace(',','.'))||0;
  const g = extras.giftcard(v);
  
  await i.followUp({embeds:[ui.embed('🎁 GIFTCARD',
    `💸 **R$ ${g.valor.toFixed(2)}**\n🔑 **Código:** \`${g.codigo}\``,
    'sucesso')],ephemeral:true}).catch(()=>{});
  return true;
};

exports.modal_criarloja = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const d = db.pegar();
  const tit = i.fields.getTextInputValue('tit')||`💛 MINIONS STORE`;
  const msg = i.fields.getTextInputValue('msg')||`✅ Entrega Automática!\nEscolha seu produto abaixo 👇`;
  const banner = i.fields.getTextInputValue('banner')||null;
  await i.channel.send({embeds:[ui.embed(tit,msg,'principal',banner)]});
  await i.channel.send({components:[ui.linhas({id:'loja_abrir',nome:'🛒 VER PRODUTOS',estilo:'Primary'})]});
  await i.reply({content:`✅ Loja criada em <#${i.channel.id}>!`,ephemeral:true}).catch(()=>{});
  return true;
};

exports.modal_fcompra = async i => {
  const pid = i.customId.split('_')[1];
  const d = db.pegar(); const ped = d.pedidos.find(x=>x.id==pid);
  if(!ped) return false;
  const cupomCod = i.fields.getTextInputValue('cupom')?.trim().toUpperCase();
  const afilCod = i.fields.getTextInputValue('afiliado')?.trim().toUpperCase();
  ped.observacoes = i.fields.getTextInputValue('obs')||'';
  let descExtra = 0;
  if(cupomCod){
    const r = extras.aplicarCupom(cupomCod, parseFloat(ped.valorTotal), ped.idUsuario);
    if(r.ok){ descExtra = r.desc; ped.cupomUsado = cupomCod; extras.usarCupom(r.cupom.id); }
  }
  if(afilCod){
    const a = d.afiliados?.find(x=>x.codigo===afilCod);
    if(a){ ped.codigoAfiliado = a.codigo; ped.afiliadoId = a.usuarioId; }
  }
  ped.valorTotal = Math.max(0, parseFloat(ped.valorTotal) - descExtra).toFixed(2);
  ped.descontoExtra = descExtra;
  ped.status = 'PENDENTE_PIX';
  db.salvar(d);
  const prod = d.produtos.find(x=>x.id==ped.produtoId);
  
  await i.followUp({embeds:[ui.embed('📋 RESUMO DO PEDIDO',
    `🆔 #${ped.id}\n📦 ${ped.produto}\n👤 ${ped.usuarioNome}\n💸 TOTAL: **R$ ${parseFloat(ped.valorTotal).toFixed(2)}**\n${descExtra>0?`🎟️ Desconto: -R$ ${descExtra.toFixed(2)}`:''}`,
    'info',prod?.imagem)],components:[ui.linhas(
      {id:`pix_${pid}`,nome:'🟡 PAGAR COM PIX',estilo:'Success'},
      {id:`cancela_${pid}`,nome:'❌ CANCELAR',estilo:'Danger'}
    )],ephemeral:true}).catch(()=>{});
  return true;
};
