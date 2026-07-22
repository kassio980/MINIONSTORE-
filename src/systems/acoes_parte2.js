module.exports = (bot) => {
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, AttachmentBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const PRODUTOS = [
  {id:'contas',nome:'🎮 Contas Premium',valor:49.90,midia:'https://i.imgur.com/ExemploConta.png'},
  {id:'diamantes',nome:'💎 Diamantes',valor:19.90,midia:''},
  {id:'vip',nome:'👑 VIP 30 Dias',valor:29.90,midia:''},
  {id:'gift20',nome:'🎁 Gift R$20',valor:20,midia:''},
  {id:'gift50',nome:'🎁 Gift R$50',valor:50,midia:''},
  {id:'curso',nome:'📚 Curso Completo',valor:97,midia:''}
];
bot._produtos = bot._produtos || PRODUTOS;

// ==================== 💰 SISTEMA PIX / VENDAS ====================
bot._acoes['menu:escolherproduto'] = async (i) => {
  const produto = PRODUTOS.find(p => p.id === i.values[0]); if(!produto) return;
  const cfg = bot.config;
  const pedidoId = `PED${Date.now()}`;
  const { payload, valor } = await bot.pix.gerarPix(cfg, produto.valor, pedidoId, i.user.tag);
  const pedido = { id:pedidoId, usuario:i.user.id, usuarioTag:i.user.tag, produtoId:produto.id, produto:produto.nome, valor, status:'AGUARDANDO', pixPayload:payload, midia:produto.midia||'', criadoEm:Date.now() };
  bot._pedidos[pedidoId] = pedido;
  if(bot.db?.salvarPedido) await bot.db.salvarPedido(pedido);
  const { embed, anexoQr } = await bot.comprovante.gerarComprovante({ usuario:i.user.tag, produto:produto.nome, valor, pedidoId, status:'AGUARDANDO', chavePix:cfg.pix.chave, titular:cfg.pix.titular, pixPayload:payload });
  embed.setDescription(`**🛒 Produto:** ${produto.nome}\n**📦 Pedido:** \`${pedidoId}\`\n**💰 Valor:** R$ ${valor}\n\n📱 Abra o app do banco, escaneie o QR ou use Copia e Cola.`);
  embed.addFields({name:'📋 Copia e Cola',value:`\`\`\`${payload}\`\`\``});
  if(produto.midia) embed.setImage(produto.midia);
  const b = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`btn:pixcopiar:${pedidoId}`).setLabel('📋 Copiar').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`btn:admpagar:${pedidoId}`).setLabel('✅ ADM Confirmar').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`btn:pixcancelar:${pedidoId}`).setLabel('❌ Cancelar').setStyle(ButtonStyle.Danger)
  );
  await i.update({ content:'', embeds:[embed], files:[anexoQr], components:[b] });
  const ch = bot.channels.cache.find(c => c.name.includes('vendas')||c.name.includes('logs'));
  if(ch) ch.send(`📢 **NOVO PEDIDO**\n👤 ${i.user}\n🛒 ${produto.nome}\n💰 R$ ${valor}\n📦 \`${pedidoId}\`\n⏳ Aguardando ADM`);
};

bot._acoes['btn:pixcopiar_*'] = async (i) => {
  const id = i.customId.split(':').slice(2).join(':');
  const ped = bot._pedidos[id] || (bot.db?.getPedido && await bot.db.getPedido(id));
  if(!ped) return i.followUp({content:'❌ Pedido não encontrado',ephemeral:true});
  await i.followUp({content:`📋 **PIX Copia e Cola:**\n\`\`\`${ped.pixPayload}\`\`\``,ephemeral:true});
};

bot._acoes['btn:admpagar_*'] = async (i) => {
  const id = i.customId.split(':').slice(2).join(':');
  if(!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.followUp({content:'🚫 **SÓ ADMINISTRADORES** confirmam pagamentos!',ephemeral:true});
  const ped = bot._pedidos[id] || (bot.db?.getPedido && await bot.db.getPedido(id));
  if(!ped) return i.followUp({content:'❌ Pedido não encontrado',ephemeral:true});
  if(ped.status==='PAGO') return i.followUp({content:'⚠️ Já foi pago!',ephemeral:true});
  ped.status='PAGO'; ped.pagoEm=Date.now(); ped.confirmadoPor=i.user.id;
  bot._pedidos[id]=ped;
  if(bot.db?.atualizarPedido) await bot.db.atualizarPedido(id,ped);
  const cfg = bot.config;
  const { embed, anexoQr } = await bot.comprovante.gerarComprovante({ usuario:ped.usuarioTag, produto:ped.produto, valor:ped.valor, pedidoId:id, status:'PAGO', chavePix:cfg.pix.chave, titular:cfg.pix.titular, pixPayload:ped.pixPayload });
  if(ped.midia) embed.setImage(ped.midia);
  await i.message.edit({ embeds:[embed], files:[anexoQr], components:[] });
  await i.followUp({content:`✅ Pedido \`${id}\` PAGO por ${i.user.tag}`,ephemeral:true});
  try{
    const cliente = await bot.users.fetch(ped.usuario);
    const entrega = new EmbedBuilder().setColor(cfg.cores.sucesso)
      .setTitle('🎉 SEU PEDIDO FOI APROVADO!')
      .setDescription(`Olá **${ped.usuarioTag}**, pagamento confirmado!\n\n🛒 **Produto:** ${ped.produto}\n💰 **Valor:** R$ ${Number(ped.valor).toFixed(2)}\n📦 **Pedido:** \`${id}\``)
      .addFields({name:'📦 Conteúdo da entrega',value:'```Aqui virá: login / senha / link / arquivo```'})
      .setFooter({text:cfg.loja.nome}).setTimestamp();
    if(ped.midia) entrega.setImage(ped.midia);
    await cliente.send({ embeds:[entrega], files:[anexoQr] });
  }catch(e){ console.log('⚠️ Entrega:',e.message) }
  const ch = bot.channels.cache.find(c => c.name.includes('vendas')||c.name.includes('logs'));
  if(ch) ch.send({content:`✅ **VENDA CONFIRMADA**\n👤 <@${ped.usuario}>\n🛒 ${ped.produto}\n💰 R$ ${Number(ped.valor).toFixed(2)}\n📦 \`${id}\`\n✅ ${i.user}`, files:[anexoQr]});
};

bot._acoes['btn:pixcancelar_*'] = async (i) => {
  const id = i.customId.split(':').slice(2).join(':');
  const ped = bot._pedidos[id] || (bot.db?.getPedido && await bot.db.getPedido(id));
  if(!ped) return;
  if(i.user.id !== ped.usuario && !i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.followUp({content:'🚫 Só dono ou ADM',ephemeral:true});
  ped.status='CANCELADO'; bot._pedidos[id]=ped;
  await i.message.delete().catch(()=>{});
  await i.followUp({content:`❌ Pedido \`${id}\` cancelado.`,ephemeral:true});
};

bot._acoes['btn:abrirmenucomprar'] = async (i) => {
  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId('menu:escolherproduto').setPlaceholder('🛒 Escolha seu produto')
      .addOptions(PRODUTOS.map(p => ({ label:p.nome, description:`R$ ${p.valor.toFixed(2)}`, value:p.id })))
  );
  await i.followUp({ content:'👇 Selecione o produto:', components:[menu], ephemeral:true });
};

bot._acoes['menu:cats'] = async (i) => {
  const menu = new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder().setCustomId('menu:escolherproduto').setPlaceholder('🛒 Produtos desta categoria')
      .addOptions(PRODUTOS.map(p => ({ label:p.nome, description:`R$ ${p.valor.toFixed(2)}`, value:p.id })))
  );
  await i.followUp({ content:`📂 **Categoria:** ${i.values[0]}\n👇 Escolha:`, components:[menu], ephemeral:true });
};

// ==================== 🎫 SISTEMA DE TICKET ====================
bot._acoes['btn:abrirticket'] = async (i) => {
  const cfg = bot.config;
  const g = i.guild;
  const cat = g.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('ticket')) || await g.channels.create({ name:'🎫 TICKETS', type:ChannelType.GuildCategory });
  const ch = await g.channels.create({
    name:`ticket-${i.user.username}`,
    type:ChannelType.GuildText,
    parent:cat.id,
    permissionOverwrites:[
      { id:g.id, deny:['ViewChannel'] },
      { id:i.user.id, allow:['ViewChannel','SendMessages','ReadMessageHistory'] },
      { id:cfg.cargos?.admin||'1505876225946812440', allow:['ViewChannel','SendMessages','ManageMessages'] }
    ]
  });
  bot._tickets[ch.id] = { usuario:i.user.id, abertoEm:Date.now() };
  const e = new EmbedBuilder().setColor(cfg.cores.info)
    .setTitle(`🎫 Ticket #${ch.name.split('-')[1]}`)
    .setDescription(`Olá ${i.user}, nossa equipe irá te atender em breve!\n\n**Descreva seu problema abaixo:**\n✅ Pedido\n✅ Dúvida\n✅ Reembolso\n✅ Parceria`)
    .setFooter({text:cfg.loja.nome}).setTimestamp();
  const b = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`btn:fecharticket:${ch.id}`).setLabel('🔒 Fechar Ticket').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`btn:addadm:${ch.id}`).setLabel('👥 Chamar ADM').setStyle(ButtonStyle.Primary)
  );
  await ch.send({ content:`${i.user} <@&${cfg.cargos?.admin||''}>`, embeds:[e], components:[b] });
  await i.followUp({ content:`✅ Ticket criado: ${ch}`, ephemeral:true });
};

bot._acoes['btn:fecharticket_*'] = async (i) => {
  const id = i.customId.split(':').slice(2).join(':');
  if(!i.member.permissions.has(PermissionFlagsBits.ManageChannels) && bot._tickets[id]?.usuario !== i.user.id)
    return i.followUp({content:'🚫 Só ADM ou o dono pode fechar',ephemeral:true});
  await i.channel.send('🔒 Ticket será fechado em 5 segundos...');
  setTimeout(()=>i.channel.delete().catch(()=>{}), 5000);
};

bot._acoes['btn:addadm_*'] = async (i) => {
  const cfg = bot.config;
  await i.channel.send(`⚠️ ${i.user} chamou a equipe! <@&${cfg.cargos?.admin||'1505876225946812440'}>`);
};

bot._acoes['btn:regras'] = async (i) => {
  const cfg = bot.config;
  const e = new EmbedBuilder().setColor(cfg.cores.aviso)
    .setTitle('📜 REGRAS DA LOJA')
    .setDescription('1️⃣ Não faça chargeback — banimento permanente\n2️⃣ Pagamentos somente via PIX\n3️⃣ Não compartilhe o produto recebido\n4️⃣ Garantia só cobre defeitos no produto\n5️⃣ Respeite a equipe de atendimento')
    .setFooter({text:cfg.loja.nome}).setTimestamp();
  await i.followUp({ embeds:[e], ephemeral:true });
};

// ==================== 🧩 Ações gerais dos outros botões ====================
['btn:pedidos','btn:afiliar','btn:ajuda','btn:ganhos','btn:saque','btn:ind','btn:cupons','btn:relvendas','btn:afil','btn:cfg','btn:cadproduto','btn:criarcupom','btn:criargift'].forEach(id => {
  bot._acoes[id] = async (i) => { await i.followUp({content:`⚙️ **${id}** — Em desenvolvimento! 🚀`,ephemeral:true}); };
});

// ==================== 📝 Ações dos MODAIS ====================
bot._acoes['modal:cadproduto'] = async (i) => {
  if(!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({content:'🚫 Só ADM',ephemeral:true});
  const nome = i.fields.getTextInputValue('nome');
  const preco = parseFloat(i.fields.getTextInputValue('preco'));
  const est = parseInt(i.fields.getTextInputValue('est')) || 999;
  const desc = i.fields.getTextInputValue('desc');
  const midia = i.fields.getTextInputValue('midia') || '';
  const novo = { id:'prod'+Date.now(), nome, valor:preco, estoque:est, desc, midia };
  bot._produtos.push(novo);
  const e = new EmbedBuilder().setColor('#10b981').setTitle('✅ PRODUTO CADASTRADO')
    .addFields({name:'Nome',value:nome,inline:true},{name:'Preço',value:`R$ ${preco.toFixed(2)}`,inline:true},{name:'Estoque',value:`${est}`,inline:true},{name:'Descrição',value:desc},{name:'📷 Mídia',value:midia||'Sem foto/vídeo'});
  if(midia) e.setImage(midia);
  await i.reply({ embeds:[e], ephemeral:true });
};

['modal:criarcupom','modal:giftcard'].forEach(id => {
  bot._acoes[id] = async (i) => {
    await i.reply({content:`✅ Dados do modal recebidos! (${id})\nFunção de salvar no banco em desenvolvimento.`,ephemeral:true});
  };
});

}; // FIM MODULE.EXPORTS
