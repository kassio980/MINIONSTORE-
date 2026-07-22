module.exports = (bot) => {
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, AttachmentBuilder, PermissionFlagsBits } = require('discord.js');
const PRODUTOS = [
  {id:'contas',nome:'🎮 Contas Premium',valor:49.90},{id:'diamantes',nome:'💎 Diamantes',valor:19.90},
  {id:'vip',nome:'👑 VIP 30 Dias',valor:29.90},{id:'gift20',nome:'🎁 Gift R$20',valor:20},
  {id:'gift50',nome:'🎁 Gift R$50',valor:50},{id:'curso',nome:'📚 Curso Completo',valor:97}
];
bot._pedidos = bot._pedidos || {};

// 🔹 Escolher produto → abre PIX
bot._acoes['menu:escolherproduto'] = async (i) => {
  const produto = PRODUTOS.find(p => p.id === i.values[0]); if(!produto) return;
  const cfg = bot.config || require('../config');
  const pedidoId = `PED${Date.now()}`;
  const { payload, valor } = await bot.pix.gerarPix(cfg, produto.valor, pedidoId, i.user.tag);
  const pedido = { id:pedidoId, usuario:i.user.id, usuarioTag:i.user.tag, produtoId:produto.id, produto:produto.nome, valor, status:'AGUARDANDO', pixPayload:payload, criadoEm:Date.now() };
  bot._pedidos[pedidoId] = pedido;
  if(bot.db?.salvarPedido) await bot.db.salvarPedido(pedido);
  const { embed, anexoQr } = await bot.comprovante.gerarComprovante({ usuario:i.user.tag, produto:produto.nome, valor, pedidoId, status:'AGUARDANDO', chavePix:cfg.pix.chave, titular:cfg.pix.titular, pixPayload:payload });
  embed.setDescription(`**Pedido:** \`${pedidoId}\`\n**Valor:** R$ ${valor}\n\n📱 Abra o app do banco, escaneie o QR ou use Copia e Cola abaixo.`);
  embed.addFields({name:'📋 Copia e Cola',value:`\`\`\`${payload}\`\`\``});
  const b = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`btn:pixcopiar:${pedidoId}`).setLabel('📋 Copiar Código').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`btn:admpagar:${pedidoId}`).setLabel('✅ ADM Confirmar').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`btn:pixcancelar:${pedidoId}`).setLabel('❌ Cancelar').setStyle(ButtonStyle.Danger)
  );
  await i.update({ content:'', embeds:[embed], files:[anexoQr], components:[b] });
  const ch = bot.channels.cache.find(c => c.name.includes('vendas')||c.name.includes('logs'));
  if(ch) ch.send(`📢 **NOVO PEDIDO**\n👤 ${i.user} (\`${i.user.id}\`)\n🛒 ${produto.nome}\n💰 R$ ${valor}\n📦 \`${pedidoId}\`\n⏳ Aguardando confirmação ADM`);
};

// 🔹 Copiar PIX
bot._acoes['btn:pixcopiar_*'] = async (i) => {
  const id = i.customId.split(':').slice(2).join(':');
  const ped = bot._pedidos[id] || (bot.db?.getPedido && await bot.db.getPedido(id));
  if(!ped) return i.followUp({content:'❌ Pedido não encontrado',ephemeral:true});
  await i.followUp({content:`📋 **Copia e Cola PIX:**\n\`\`\`${ped.pixPayload}\`\`\``,ephemeral:true});
};

// 🔹 ✅ SÓ ADM CONFIRMA PAGAMENTO
bot._acoes['btn:admpagar_*'] = async (i) => {
  const id = i.customId.split(':').slice(2).join(':');
  if(!i.member.permissions.has(PermissionFlagsBits.Administrator))
    return i.followUp({content:'🚫 **APENAS ADMINISTRADORES** podem confirmar pagamentos!',ephemeral:true});
  const ped = bot._pedidos[id] || (bot.db?.getPedido && await bot.db.getPedido(id));
  if(!ped) return i.followUp({content:'❌ Pedido não encontrado',ephemeral:true});
  if(ped.status==='PAGO') return i.followUp({content:'⚠️ Esse pedido já foi pago!',ephemeral:true});
  ped.status='PAGO'; ped.pagoEm=Date.now(); ped.confirmadoPor=i.user.id;
  bot._pedidos[id]=ped;
  if(bot.db?.atualizarPedido) await bot.db.atualizarPedido(id,ped);
  const cfg = bot.config || require('../config');
  const { embed, anexoQr } = await bot.comprovante.gerarComprovante({ usuario:ped.usuarioTag, produto:ped.produto, valor:ped.valor, pedidoId:id, status:'PAGO', chavePix:cfg.pix.chave, titular:cfg.pix.titular, pixPayload:ped.pixPayload });
  await i.message.edit({ embeds:[embed], files:[anexoQr], components:[] });
  await i.followUp({content:`✅ Pedido \`${id}\` **PAGO** por ${i.user.tag}`,ephemeral:true});
  try{
    const cliente = await bot.users.fetch(ped.usuario);
    const entrega = new EmbedBuilder().setColor(cfg.cores.sucesso)
      .setTitle('🎉 SEU PEDIDO FOI APROVADO!')
      .setDescription(`Olá **${ped.usuarioTag}**, seu pagamento foi confirmado!\n\n🛒 **Produto:** ${ped.produto}\n💰 **Valor:** R$ ${Number(ped.valor).toFixed(2)}\n📦 **Pedido:** \`${id}\``)
      .addFields({name:'📦 Conteúdo da entrega',value:'```Aqui virá: login / senha / link / arquivo do produto```'})
      .setFooter({text:cfg.loja.nome}).setTimestamp();
    await cliente.send({ embeds:[entrega], files:[anexoQr] });
  }catch(e){ console.log('⚠️ Entrega privado:',e.message) }
  const ch = bot.channels.cache.find(c => c.name.includes('vendas')||c.name.includes('logs'));
  if(ch) ch.send({content:`✅ **VENDA CONFIRMADA**\n👤 <@${ped.usuario}>\n🛒 ${ped.produto}\n💰 R$ ${Number(ped.valor).toFixed(2)}\n📦 \`${id}\`\n✅ Confirmado por: ${i.user}`, files:[anexoQr]});
};

// 🔹 Cancelar pedido
bot._acoes['btn:pixcancelar_*'] = async (i) => {
  const id = i.customId.split(':').slice(2).join(':');
  const ped = bot._pedidos[id] || (bot.db?.getPedido && await bot.db.getPedido(id));
  if(!ped) return;
  if(i.user.id !== ped.usuario && !i.member.permissions.has(PermissionFlagsBits.Administrator))
    return i.followUp({content:'🚫 Apenas o dono ou ADM pode cancelar',ephemeral:true});
  ped.status='CANCELADO'; bot._pedidos[id]=ped;
  await i.message.delete().catch(()=>{});
  await i.followUp({content:`❌ Pedido \`${id}\` cancelado.`,ephemeral:true});
};

// 🔹 Botão comprar no /inicio
bot._acoes['btn:abrirmenucomprar'] = async (i) => {
  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId('menu:escolherproduto').setPlaceholder('🛒 Escolha seu produto')
      .addOptions(PRODUTOS.map(p => ({ label:p.nome, description:`R$ ${p.valor.toFixed(2)}`, value:p.id })))
  );
  await i.followUp({ content:'👇 Selecione o produto que deseja comprar:', components:[menu], ephemeral:true });
};

// 🔹 Ações de outros botões
['btn:pedidos','btn:afiliar','btn:ajuda','btn:ganhos','btn:saque','btn:ind','btn:cupons','btn:relvendas','btn:afil','btn:cfg','btn:cadproduto','btn:criarcupom','btn:criargift'].forEach(id => {
  bot._acoes[id] = async (i) => { await i.followUp({content:`⚙️ **${id}** — Função em desenvolvimento, já já está no ar! 🚀`,ephemeral:true}); };
});
bot._acoes['menu:cats'] = async (i) => {
  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId('menu:escolherproduto').setPlaceholder('🛒 Produtos desta categoria')
      .addOptions(PRODUTOS.map(p => ({ label:p.nome, description:`R$ ${p.valor.toFixed(2)}`, value:p.id })))
  );
  await i.followUp({ content:`📂 **Categoria:** ${i.values[0]}\n👇 Escolha o produto:`, components:[menu], ephemeral:true });
};

}; // FIM
