const db = require('../database');
const ui = require('./ui');

module.exports = bot => {
const BOTOES_LOJA = {
  comprar:{n:'COMPRAR',e:'💳',s:'Success'},
  carrinho:{n:'+ CARRINHO',e:'🛒',s:'Primary'},
  fav:{n:'FAVORITAR',e:'⭐',s:'Secondary'},
  voltar:{n:'OUTROS',e:'🔄',s:'Danger'}
};

function pegarBtn(id){
  const d = db.pegar();
  const p = (d.botoes||[]).find(b=>b.dadosAcao?.local==='loja' && b.dadosAcao?.bid===id);
  return p ? {n:p.nome,e:p.emoji,s:p.estilo} : BOTOES_LOJA[id];
}

bot._acoes['menu:menu_prod'] = async i => {
  const v = i.values[0]; if(!v||v==='vazio') return true;
  const pid = v.split('_')[1];
  const d = db.pegar(); const p = d.produtos.find(x=>x.id==pid); if(!p) return true;
  const layout = d.layouts.find(l=>l.produtoId==pid && l.publicado);
  const texto = layout ? await bot.lb.renderizar(layout,p) :
    `📝 **Descrição:**\n${p.descricao||''}\n\n💸 **Preço:** **R$ ${parseFloat(p.preco).toFixed(2)}**\n📦 **Estoque:** ${p.estoque}\n⭐ **Avaliação:** ${p.avaliacao||'5.0'}\n🛡️ **Garantia:** ${p.garantia||'30d'}`;
  let arq=[];
  try{ const buf = await bot.gerImg.cardProduto(p); if(buf) arq=[{attachment:buf,name:`p_${p.id}.png`}]; }catch(e){}
  const bC=pegarBtn('comprar'),bK=pegarBtn('carrinho'),bF=pegarBtn('fav'),bV=pegarBtn('voltar');
  await i.editReply({content:'',embeds:[ui.embed(`📦 ${p.nome}`,texto,'principal',p.imagem).setFooter({text:`⭐ ${p.avaliacao||'5.0'} • ${p.vendas||0} vendas • Est:${p.estoque}`})],files:arq,components:[ui.linhas(
    {id:`comprar_${p.id}`,nome:bC.n,emoji:bC.e,estilo:bC.s},
    {id:`carrinho_${p.id}`,nome:bK.n,emoji:bK.e,estilo:bK.s},
    {id:`favoritar_${p.id}`,nome:bF.n,emoji:bF.e,estilo:bF.s},
    {id:'loja_abrir',nome:bV.n,emoji:bV.e,estilo:bV.s}
  )]}).catch(()=>{});
  return true;
};

bot._acoes['btn:*'] = async i => {
  const id = i.customId;
  if(id.startsWith('comprar_')){
    const pid = id.split('_')[1];
    const d = db.pegar(); const p = d.produtos.find(x=>x.id==pid); if(!p) return true;
    let u = d.usuarios.find(x=>x.id===i.user.id);
    if(!u){ u={id:i.user.id,nome:i.user.username,gastoTotal:0,vendas:0,nivel:1}; d.usuarios.push(u); }
    const nv = d.niveis.find(x=>x.id===u.nivel)||d.niveis[0];
    const desc = parseFloat(p.preco)*nv.desconto/100;
    const total = Math.max(0,parseFloat(p.preco)-desc);
    const ped = {id:Date.now(),produto:p.nome,produtoId:p.id,idUsuario:i.user.id,usuarioNome:i.user.username,valorUnitario:parseFloat(p.preco),valorTotal:total.toFixed(2),descontoAplicado:nv.desconto,status:'AGUARDANDO',data:new Date().toLocaleString('pt-BR'),nivelCliente:u.nivel};
    d.pedidos.push(ped); p.vendas=(p.vendas||0)+1; db.salvar(d);
    await i.showModal(ui.modal(`fcompra_${ped.id}`,'FINALIZAR COMPRA',
      {id:'obs',nome:'Observações',tipo:'Paragraph',obrigatorio:false},
      {id:'cupom',nome:'Cupom',obrigatorio:false},{id:'afiliado',nome:'Afiliado',obrigatorio:false}
    ));
    return true;
  }
  if(id.startsWith('pix_')){
    const pid = id.split('_')[1];
    const d = db.pegar(); const ped = d.pedidos.find(x=>x.id==pid); if(!ped) return true;
    await i.editReply({embeds:[ui.embed('🟡 PIX',`📦 ${ped.produto}\n👤 ${i.user}\n💸 **R$ ${parseFloat(ped.valorTotal).toFixed(2)}**\n\n🔑 \`${bot.config.pix.chave||'Configure no .env'}\`\n👤 ${bot.config.pix.titular||''}\n🏙️ ${bot.config.pix.cidade||''}\n\n✅ Pague e avise o admin!`,'sucesso')],components:[ui.linhas({id:`adminconf_${pid}`,nome:'✅ ADMIN CONFIRMAR',estilo:'Success'},{id:`cancela_${pid}`,nome:'❌ CANCELAR',estilo:'Danger'})]}).catch(()=>{});
    return true;
  }
  return false;
};

bot._acoes['btn:adminconf_*'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const pid = i.customId.replace('adminconf_','');
  const d = db.pegar(); const ped = d.pedidos.find(x=>x.id==pid); if(!ped) return true;
  ped.status='PAGO ✅'; ped.dataPagamento = new Date().toLocaleString('pt-BR');
  const prod = d.produtos.find(x=>x.id==ped.produtoId);
  let cli = d.usuarios.find(x=>x.id==ped.idUsuario) || {nome:ped.usuarioNome,nivel:1};
  cli.nome = cli.nome || ped.usuarioNome;
  cli.nivelNome = (d.niveis.find(x=>x.id===cli.nivel)||d.niveis[0]).nome;
  let arq=[];
  try{ const buf = await bot.gerImg.comprovanteCompra(ped,cli,prod); if(buf) arq=[{attachment:buf,name:`comp_${pid}.png`}]; }catch(e){}
  d.estatisticas.totalVendas++; d.estatisticas.valorTotal += parseFloat(ped.valorTotal);
  if(!d.estatisticas.primeiraVenda) d.estatisticas.primeiraVenda=ped.dataPagamento;
  d.estatisticas.ultimaVenda=ped.dataPagamento;
  const pts = bot.extras.addPontos(ped.idUsuario, parseFloat(ped.valorTotal));
  if(ped.codigoAfiliado){
    const ra = bot.extras.vendaAfiliado(ped.codigoAfiliado, parseFloat(ped.valorTotal));
    if(ra) try{ (await bot.users.fetch(ra.a.usuarioId)).send(`💸 Comissão R$ ${ra.com.toFixed(2)}!`).catch(()=>{}) }catch(e){}
  }
  db.salvar(d);
  try{ const uc = await bot.users.fetch(ped.idUsuario); uc.send({content:`✅ PAGAMENTO CONFIRMADO! #${pid}\n🪙 +${pts} pontos`,files:arq}).catch(()=>{}) }catch(e){}
  if(d.config.canalComprovantes) try{ (await bot.channels.fetch(d.config.canalComprovantes)).send({content:`🎉 NOVA VENDA #${pid}\n👤 ${ped.usuarioNome}\n📦 ${ped.produto}\n💸 R$ ${parseFloat(ped.valorTotal).toFixed(2)}`,files:arq}).catch(()=>{}) }catch(e){}
  await i.editReply({embeds:[ui.embed('✅ PAGO!',`#${pid}\n👤 ${ped.usuarioNome}\n📦 ${ped.produto}\n💸 R$ ${parseFloat(ped.valorTotal).toFixed(2)}\n🪙 +${pts} pts`,'sucesso')],components:[ui.linhas({id:`entregar_${pid}`,nome:'📦 ENTREGAR',estilo:'Success'})],files:arq}).catch(()=>{});
  return true;
};

bot._acoes['btn:entregar_*'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const pid = i.customId.replace('entregar_','');
  const d = db.pegar(); const ped = d.pedidos.find(x=>x.id==pid); if(!ped) return true;
  ped.status='ENTREGUE ✅'; ped.dataEntrega = new Date().toLocaleString('pt-BR');
  let cli = d.usuarios.find(x=>x.id===ped.idUsuario);
  if(!cli){ cli={id:ped.idUsuario,nome:ped.usuarioNome,gastoTotal:0,vendas:0,nivel:1}; d.usuarios.push(cli); }
  const nvAnt = cli.nivel;
  cli.gastoTotal += parseFloat(ped.valorTotal); cli.vendas++;
  cli.nivel = d.niveis.slice().reverse().find(n=>cli.gastoTotal>=n.minimo)?.id || 1;
  const nvNovo = d.niveis.find(x=>x.id===cli.nivel);
  db.salvar(d);
  try{
    const uc = await bot.users.fetch(ped.idUsuario);
    let msg = `📦 ENTREGUE! Pedido #${pid} finalizado com sucesso!`;
    if(nvNovo && nvAnt !== cli.nivel) msg += `\n🎖️ SUBIU DE NÍVEL: **${nvNovo.nome}**!`;
    await uc.send({embeds:[ui.embed('📦 ENTREGA CONCLUÍDA',msg,'sucesso')]}).catch(()=>{});
  }catch(e){}
  await i.editReply({embeds:[ui.embed('✅ ENTREGUE',`Pedido #${pid} finalizado com sucesso!`,'sucesso')],components:[]}).catch(()=>{});
  return true;
};

bot._acoes['btn:admin_cadprod'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const cmd = bot.comandos.get('cadproduto'); if(cmd) await cmd.executar(i,bot); return true;
};

bot._acoes['btn:admin_criarcupom'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const cmd = bot.comandos.get('criarcupom'); if(cmd) await cmd.executar(i,bot); return true;
};

bot._acoes['btn:admin_criargift'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  return i.showModal(ui.modal('modal_gift','NOVO GIFTCARD',{id:'valor',nome:'Valor em R$',obrigatorio:true}));
};

bot._acoes['btn:admin_criarloja'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  return i.showModal(ui.modal('modal_criarloja','CRIAR LOJA AQUI',{id:'tit',nome:'Título da Loja',obrigatorio:false},{id:'msg',nome:'Mensagem principal',tipo:'Paragraph',obrigatorio:false},{id:'banner',nome:'URL da imagem',obrigatorio:false}));
};

bot._acoes['btn:admin_togglebf'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const d = db.pegar(); d.config.blackFriday = !d.config.blackFriday; db.salvar(d);
  await i.editReply({embeds:[ui.embed(d.config.blackFriday?'🔥 BLACK FRIDAY ATIVA!':'🖤 BLACK FRIDAY DESATIVADA',d.config.blackFriday?'Todos produtos -20% automático!':'Preços normais restaurados',d.config.blackFriday?'sucesso':'aviso')]}).catch(()=>{});
  const cmd = bot.comandos.get('paineladmin'); if(cmd) await cmd.executar(i,bot); return true;
};

bot._acoes['btn:admin_backup'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const fs = require('fs'); const caminho = './banco.json'; const data = new Date().toLocaleString('pt-BR').replace(/[^\w]/g,'-');
  await i.followUp({content:`💾 Backup gerado em ${new Date().toLocaleString('pt-BR')}`,files:[{attachment:caminho,name:`backup_${data}.json`}],ephemeral:true}).catch(()=>{});
  return true;
};

bot._acoes['btn:cancela_*'] = async i => {
  const pid = i.customId.replace('cancela_',''); const d = db.pegar(); const ped = d.pedidos.find(x=>x.id==pid);
  if(ped){ ped.status='CANCELADO ❌'; db.salvar(d); }
  await i.editReply({embeds:[ui.embed('❌ CANCELADO','Pedido removido.','aviso')],components:[]}).catch(()=>{});
  return true;
};

bot._acoes['btn:botoes'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  await i.followUp({content:'⚙️ Sistema de personalização de botões em construção!',ephemeral:true});
  return true;
};

bot._acoes['btn:gerenciar'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const cmd = bot.comandos.get('paineladmin'); if(cmd) await cmd.executar(i,bot);
  return true;
};

bot._acoes['btn:gift'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  return i.showModal(ui.modal('modal_gift','NOVO GIFTCARD',{id:'valor',nome:'Valor em R$',obrigatorio:true}));
};

bot._acoes['btn:ranking'] = async i => {
  const d = db.pegar();
  const top = d.usuarios.sort((a,b)=>(b.gastoTotal||0)-(a.gastoTotal||0)).slice(0,10);
  let texto = '🏆 **RANKING DE CLIENTES** 🏆\n\n';
  top.forEach((u,pos)=> texto += `${pos+1}º • ${u.nome||'Sem nome'} • Gasto R$ ${parseFloat(u.gastoTotal||0).toFixed(2)}\n`);
  await i.followUp({embeds:[ui.embed('🏆 RANKING',texto||'Nenhuma venda registrada ainda','info')],ephemeral:true});
  return true;
};

bot._acoes['btn:bf_on'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const d = db.pegar(); d.config.blackFriday = true; db.salvar(d);
  await i.followUp({embeds:[ui.embed('🔥 BLACK FRIDAY ATIVA!','Todos produtos com 20% de desconto automático!','sucesso')],ephemeral:true});
  const cmd = bot.comandos.get('paineladmin'); if(cmd) await cmd.executar(i,bot);
  return true;
};

bot._acoes['btn:bf_off'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const d = db.pegar(); d.config.blackFriday = false; db.salvar(d);
  await i.followUp({embeds:[ui.embed('🖤 BLACK FRIDAY DESATIVADA','Preços voltaram ao normal.','aviso')],ephemeral:true});
  const cmd = bot.comandos.get('paineladmin'); if(cmd) await cmd.executar(i,bot);
  return true;
};

bot._acoes['btn:painelvendas'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const d = db.pegar();
  let texto = '📋 **ÚLTIMOS PEDIDOS**\n';
  d.pedidos.slice(-15).reverse().forEach(p=> texto += `#${p.id} • ${p.usuarioNome} • R$ ${p.valorTotal} • ${p.status}\n`);
  await i.followUp({embeds:[ui.embed('📦 VENDAS',texto||'Nenhum pedido ainda','info')],ephemeral:true});
  return true;
};

bot._acoes['btn:painelticket'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  await i.followUp({content:'🎫 Sistema de tickets em construção!',ephemeral:true});
  return true;
};

bot._acoes['btn:loja_abrir'] = async i => {
  const d = db.pegar();
  const prods = d.produtos.filter(p=>p.publicado && p.estoque>0).slice(0,25);
  if(!prods.length){ await i.followUp({content:'⚠️ Nenhum produto disponível',ephemeral:true}).catch(()=>{}); return true; }
  await i.followUp({content:'📦 Escolha um produto:',ephemeral:true,components:[{type:1,components:[{type:3,custom_id:'menu_prod',placeholder:'👇 Selecione',options: prods.map(p=>({label:p.nome.slice(0,95),value:`p_${p.id}`,description:`R$ ${parseFloat(p.preco).toFixed(2)} | Est:${p.estoque}`,emoji:{name:'📦'}}))}]}]}).catch(()=>{});
  return true;
};

bot._acoes['btn:suporte'] = async i => {
  await i.followUp({content:'📞 Para suporte, chame um Administrador ou use o sistema de tickets!',ephemeral:true});
  return true;
};

bot._acoes['btn:perfil'] = async i => {
  const d = db.pegar();
  let u = d.usuarios.find(x=>x.id===i.user.id);
  if(!u){ u={id:i.user.id,nome:i.user.username,gastoTotal:0,vendas:0,nivel:1}; d.usuarios.push(u); db.salvar(d); }
  const nv = d.niveis.find(x=>x.id===u.nivel)||d.niveis[0];
  await i.followUp({embeds:[ui.embed(`👤 PERFIL DE ${u.nome}`,`🪙 Nível: **${nv.nome}**\n💸 Total gasto: R$ ${parseFloat(u.gastoTotal||0).toFixed(2)}\n🛒 Compras feitas: ${u.vendas||0}\n🎖️ Desconto: ${nv.desconto}%`,'principal')],ephemeral:true});
  return true;
};

bot._acoes['btn:admin'] = async i => {
  if(!i.member.permissions.has('Administrator')) return false;
  const cmd = bot.comandos.get('paineladmin'); if(cmd) await cmd.executar(i,bot);
  return true;
};

bot._acoes['btn:inicio_voltar'] = async i => {
  const cmd = bot.comandos.get('inicio'); if(cmd) await cmd.executar(i,bot);
  return true;
};

bot._acoes['modal:modal_cadprod'] = require('./s_modais').modal_cadprod;
bot._acoes['modal:modal_criarcupom'] = require('./s_modais').modal_criarcupom;
bot._acoes['modal:modal_gift'] = require('./s_modais').modal_gift;
bot._acoes['modal:modal_criarloja'] = require('./s_modais').modal_criarloja;
bot._acoes['modal:fcompra'] = require('./s_modais').modal_fcompra;

console.log('✅ Ações Parte 2 carregadas');
};
