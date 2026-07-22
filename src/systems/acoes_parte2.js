module.exports = (bot) => {
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

const PRODUTOS_PADRAO = [
  {id:'contas',nome:'🎮 Contas Premium',valor:49.90,estoque:999,desc:'Contas garantidas',midia:'https://i.imgur.com/ExemploConta.png'},
  {id:'diamantes',nome:'💎 Diamantes',valor:19.90,estoque:999,desc:'Entrega imediata',midia:''},
  {id:'vip',nome:'👑 VIP 30 Dias',valor:29.90,estoque:999,desc:'VIP por 30 dias',midia:''},
  {id:'gift20',nome:'🎁 Gift R$20',valor:20,estoque:999,desc:'Gift R$20',midia:''},
  {id:'gift50',nome:'🎁 Gift R$50',valor:50,estoque:999,desc:'Gift R$50',midia:''},
  {id:'curso',nome:'📚 Curso Completo',valor:97,estoque:999,desc:'Curso completo',midia:''}
];
bot._produtos = bot._produtos?.length ? bot._produtos : PRODUTOS_PADRAO;

// 🔘 BOTÕES PAINEL ADMIN → ABREM MODAIS
bot._acoes['btn:abrircadproduto'] = async (i) => {
  const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
  const m = new ModalBuilder().setCustomId('modal:cadproduto').setTitle('➕ NOVO PRODUTO');
  m.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('✅ Nome').setStyle(1).setRequired(true).setMaxLength(60)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('preco').setLabel('💰 Preço ex:29.90').setStyle(1).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('est').setLabel('📦 Estoque').setStyle(1).setValue('999').setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('📝 Descrição').setStyle(2).setRequired(true).setMaxLength(500)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('midia').setLabel('📷 LINK FOTO/VIDEO').setStyle(1).setRequired(false).setPlaceholder('https://i.imgur.com/foto.png'))
  );
  await i.showModal(m);
};
bot._acoes['btn:abrircriarcupom'] = async (i) => {
  const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
  const m = new ModalBuilder().setCustomId('modal:criarcupom').setTitle('🎟️ CRIAR CUPOM');
  m.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cod').setLabel('Código ex:MINIONS10').setStyle(1).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('pct').setLabel('% 1-100').setStyle(1).setValue('10').setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('usos').setLabel('Usos').setStyle(1).setValue('100').setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('dias').setLabel('Dias').setStyle(1).setValue('30').setRequired(true))
  );
  await i.showModal(m);
};
bot._acoes['btn:abrirgift'] = async (i) => {
  const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
  const m = new ModalBuilder().setCustomId('modal:giftcard').setTitle('💳 GIFT CARD');
  m.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('valor').setLabel('Valor ex:50.00').setStyle(1).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('qtd').setLabel('Quantidade').setStyle(1).setValue('1').setRequired(true))
  );
  await i.showModal(m);
};

// 📝 MODAIS — RECEBEM DADOS + EXIBEM IMAGEM
bot._acoes['modal:cadproduto'] = async (i) => {
  if(!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({content:'🚫 Só ADM',ephemeral:true});
  const nome=i.fields.getTextInputValue('nome'), preco=parseFloat(i.fields.getTextInputValue('preco'));
  const est=parseInt(i.fields.getTextInputValue('est'))||999, desc=i.fields.getTextInputValue('desc'), midia=i.fields.getTextInputValue('midia')||'';
  if(isNaN(preco)||preco<=0) return i.reply({content:'❌ Preço inválido',ephemeral:true});
  const novo={id:'prod'+Date.now(),nome,valor:preco,estoque:est,desc,midia}; bot._produtos.push(novo);
  const e=new EmbedBuilder().setColor('#10b981').setTitle('✅ PRODUTO CADASTRADO')
    .addFields({name:'📦 Nome',value:nome,inline:true},{name:'💰 Preço',value:`R$ ${preco.toFixed(2)}`,inline:true},{name:'📊 Estoque',value:`${est}`,inline:true},{name:'📝 Descrição',value:desc},{name:'📷 Mídia',value:midia||'Sem foto/vídeo'});
  if(midia) e.setImage(midia);
  await i.reply({content:'✅ Já aparece no menu de compra!',embeds:[e],ephemeral:true});
};
bot._acoes['modal:criarcupom'] = async (i) => {
  const cod=i.fields.getTextInputValue('cod').toUpperCase(), pct=parseInt(i.fields.getTextInputValue('pct'));
  const usos=parseInt(i.fields.getTextInputValue('usos')), dias=parseInt(i.fields.getTextInputValue('dias'));
  const e=new EmbedBuilder().setColor('#3b82f6').setTitle('🎟️ CUPOM CRIADO')
    .addFields({name:'Código',value:`\`${cod}\``,inline:true},{name:'%',value:`${pct}%`,inline:true},{name:'Usos',value:`${usos}`,inline:true},{name:'Validade',value:`${dias} dias`,inline:true});
  await i.reply({embeds:[e],ephemeral:true});
};
bot._acoes['modal:giftcard'] = async (i) => {
  const valor=parseFloat(i.fields.getTextInputValue('valor')), qtd=parseInt(i.fields.getTextInputValue('qtd'));
  const cods=Array.from({length:qtd},()=>'GIFT-'+Math.random().toString(36).slice(2,8).toUpperCase()+'-'+Math.random().toString(36).slice(2,6).toUpperCase());
  const e=new EmbedBuilder().setColor('#f59e0b').setTitle('💳 GIFTS GERADOS')
    .setDescription(`Valor: R$ ${valor.toFixed(2)} cada\nQtd: ${qtd}\n\n\`\`\`${cods.join('\n')}\`\`\``);
  await i.reply({embeds:[e],ephemeral:true});
};

// 💰 SISTEMA PIX / VENDAS
bot._acoes['menu:escolherproduto'] = async (i) => {
  const p = bot._produtos.find(x=>x.id===i.values[0]) || PRODUTOS_PADRAO.find(x=>x.id===i.values[0]);
  if(!p) return i.followUp({content:'❌ Produto não encontrado',ephemeral:true});
  const cfg=bot.config, pid=`PED${Date.now()}`;
  const {payload,valor}=await bot.pix.gerarPix(cfg,p.valor,pid,i.user.tag);
  const ped={id:pid,usuario:i.user.id,usuarioTag:i.user.tag,produtoId:p.id,produto:p.nome,valor,status:'AGUARDANDO',pixPayload:payload,midia:p.midia||''};
  bot._pedidos[pid]=ped;
  const {embed,anexoQr}=await bot.comprovante.gerarComprovante({usuario:i.user.tag,produto:p.nome,valor,pedidoId:pid,status:'AGUARDANDO',chavePix:cfg.pix.chave,titular:cfg.pix.titular,pixPayload:payload});
  embed.setDescription(`**🛒 ${p.nome}**\n📦 \`${pid}\`\n💰 R$ ${valor}\n\n📱 Abra o banco, escaneie QR ou Copia e Cola.`);
  embed.addFields({name:'📋 Copia e Cola',value:`\`\`\`${payload}\`\`\``});
  if(p.midia) embed.setImage(p.midia);
  const b=new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`btn:pixcopiar:${pid}`).setLabel('📋 Copiar').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`btn:admpagar:${pid}`).setLabel('✅ ADM Confirmar').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`btn:pixcancelar:${pid}`).setLabel('❌ Cancelar').setStyle(ButtonStyle.Danger)
  );
  await i.update({content:'',embeds:[embed],files:[anexoQr],components:[b]});
  const ch=bot.channels.cache.find(c=>c.name.includes('vendas')||c.name.includes('logs'));
  if(ch) ch.send(`📢 **NOVO PEDIDO**\n👤 ${i.user}\n🛒 ${p.nome}\n💰 R$ ${valor}\n📦 \`${pid}\``);
};
bot._acoes['btn:pixcopiar_*'] = async (i) => {
  const id=i.customId.split(':').slice(2).join(':'), ped=bot._pedidos[id];
  if(!ped) return i.followUp({content:'❌ Pedido não encontrado',ephemeral:true});
  await i.followUp({content:`📋 **PIX:**\n\`\`\`${ped.pixPayload}\`\`\``,ephemeral:true});
};
bot._acoes['btn:admpagar_*'] = async (i) => {
  const id=i.customId.split(':').slice(2).join(':');
  if(!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.followUp({content:'🚫 **SÓ ADMINISTRADORES** confirmam!',ephemeral:true});
  const ped=bot._pedidos[id]; if(!ped) return i.followUp({content:'❌ Não encontrado',ephemeral:true});
  if(ped.status==='PAGO') return i.followUp({content:'⚠️ Já foi pago!',ephemeral:true});
  ped.status='PAGO'; ped.pagoEm=Date.now(); ped.confirmadoPor=i.user.id;
  const cfg=bot.config;
  const {embed,anexoQr}=await bot.comprovante.gerarComprovante({usuario:ped.usuarioTag,produto:ped.produto,valor:ped.valor,pedidoId:id,status:'PAGO',chavePix:cfg.pix.chave,titular:cfg.pix.titular,pixPayload:ped.pixPayload});
  if(ped.midia) embed.setImage(ped.midia);
  await i.message.edit({embeds:[embed],files:[anexoQr],components:[]});
  await i.followUp({content:`✅ \`${id}\` PAGO por ${i.user.tag}`,ephemeral:true});
  try{
    const cli=await bot.users.fetch(ped.usuario);
    const ent=new EmbedBuilder().setColor(cfg.cores.sucesso).setTitle('🎉 PEDIDO APROVADO!')
      .setDescription(`Olá **${ped.usuarioTag}**!\n\n🛒 ${ped.produto}\n💰 R$ ${Number(ped.valor).toFixed(2)}\n📦 \`${id}\``)
      .addFields({name:'📦 Conteúdo',value:'```login / senha / link / arquivo```'}).setFooter({text:cfg.loja.nome}).setTimestamp();
    if(ped.midia) ent.setImage(ped.midia);
    await cli.send({embeds:[ent],files:[anexoQr]});
  }catch(e){console.log('⚠️ Entrega:',e.message)}
  const ch=bot.channels.cache.find(c=>c.name.includes('vendas')||c.name.includes('logs'));
  if(ch) ch.send({content:`✅ **VENDA**\n👤 <@${ped.usuario}>\n🛒 ${ped.produto}\n💰 R$ ${Number(ped.valor).toFixed(2)}\n📦 \`${id}\`\n✅ ${i.user}`,files:[anexoQr]});
};
bot._acoes['btn:pixcancelar_*'] = async (i) => {
  const id=i.customId.split(':').slice(2).join(':'), ped=bot._pedidos[id]; if(!ped) return;
  if(i.user.id!==ped.usuario && !i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.followUp({content:'🚫 Só dono/ADM',ephemeral:true});
  ped.status='CANCELADO'; await i.message.delete().catch(()=>{});
  await i.followUp({content:`❌ \`${id}\` cancelado.`,ephemeral:true});
};
bot._acoes['btn:abrirmenucomprar'] = async (i) => {
  const m=new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('menu:escolherproduto').setPlaceholder('🛒 Escolha')
    .addOptions(bot._produtos.slice(0,25).map(p=>({label:p.nome.slice(0,25),description:`R$ ${Number(p.valor).toFixed(2)}`,value:p.id}))));
  await i.followUp({content:'👇 Produto:',components:[m],ephemeral:true});
};
bot._acoes['menu:cats'] = async (i) => {
  const m=new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('menu:escolherproduto').setPlaceholder('🛒 Produtos')
    .addOptions(bot._produtos.slice(0,25).map(p=>({label:p.nome.slice(0,25),description:`R$ ${Number(p.valor).toFixed(2)}`,value:p.id}))));
  await i.followUp({content:`📂 **${i.values[0]}**\n👇 Escolha:`,components:[m],ephemeral:true});
};

// 🎫 TICKET COMPLETO — ENVIA FOTO E VIDEO NORMALMENTE
bot._acoes['btn:abrirticketreal'] = async (i) => {
  const cfg=bot.config, g=i.guild;
  let cat = g.channels.cache.find(c=>c.type===ChannelType.GuildCategory && c.name.toLowerCase().includes('ticket'));
  if(!cat) cat = await g.channels.create({name:'🎫 TICKETS',type:ChannelType.GuildCategory});
  const ch = await g.channels.create({
    name:`ticket-${i.user.username}`,
    type:ChannelType.GuildText,
    parent:cat.id,
    topic:`Ticket de ${i.user.tag} | ID: ${i.user.id}`,
    permissionOverwrites:[
      {id:g.id,deny:['ViewChannel']},
      {id:i.user.id,allow:['ViewChannel','SendMessages','ReadMessageHistory','AttachFiles','EmbedLinks']},
      {id:cfg.cargos?.admin||'1505876225946812440',allow:['ViewChannel','SendMessages','ManageMessages','AttachFiles','EmbedLinks']}
    ]
  });
  bot._tickets[ch.id]={usuario:i.user.id,abertoEm:Date.now()};
  const e=new EmbedBuilder().setColor(cfg.cores.info).setTitle(`🎫 Ticket #${ch.name.split('-')[1]}`)
    .setDescription(`Olá ${i.user}, bem-vindo ao atendimento!\n\n**📷 Você pode enviar FOTOS e VÍDEOS normalmente aqui.**\n\nDescreva abaixo:\n✅ Pedido / dúvida\n✅ Reembolso\n✅ Parceria`)
    .addFields({name:'👤 Cliente',value:`${i.user}`,inline:true},{name:'🆔',value:`\`${i.user.id}\``,inline:true},{name:'📅',value:new Date().toLocaleString('pt-BR'),inline:true})
    .setFooter({text:cfg.loja.nome}).setTimestamp();
  const b=new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`btn:fecharticket:${ch.id}`).setLabel('🔒 Fechar').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`btn:chamaradm:${ch.id}`).setLabel('👥 Chamar Equipe').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`btn:addusuario:${ch.id}`).setLabel('➕ Adicionar').setStyle(ButtonStyle.Secondary)
  );
  await ch.send({content:`${i.user} <@&${cfg.cargos?.admin||'1505876225946812440'}>`,embeds:[e],components:[b]});
  await i.followUp({content:`✅ Ticket criado: ${ch}`,ephemeral:true});
};
bot._acoes['btn:fecharticket_*'] = async (i) => {
  const id=i.customId.split(':').slice(2).join(':');
  const t=bot._tickets[id];
  if(!i.member.permissions.has(PermissionFlagsBits.ManageChannels) && t?.usuario!==i.user.id)
    return i.followUp({content:'🚫 Só ADM ou dono',ephemeral:true});
  await i.channel.send('🔒 Fechando em 5s...');
  setTimeout(()=>i.channel.delete().catch(()=>{}),5000);
};
bot._acoes['btn:chamaradm_*'] = async (i) => {
  const cfg=bot.config;
  await i.channel.send(`⚠️ ${i.user} chamou a equipe! <@&${cfg.cargos?.admin||'1505876225946812440'}>`);
};
bot._acoes['btn:addusuario_*'] = async (i) => {
  if(!i.member.permissions.has(PermissionFlagsBits.ManageChannels)) return i.followUp({content:'🚫 Só ADM',ephemeral:true});
  await i.followUp({content:'✏️ Mencione o usuário para adicionar:',ephemeral:true});
};
bot._acoes['btn:regras'] = async (i) => {
  const cfg=bot.config;
  const e=new EmbedBuilder().setColor(cfg.cores.aviso).setTitle('📜 REGRAS DA LOJA')
    .setDescription('1️⃣ Chargeback = BAN permanente\n2️⃣ Pagamentos somente via PIX\n3️⃣ Não compartilhe o produto\n4️⃣ Garantia só cobre defeitos\n5️⃣ Respeite a equipe de atendimento')
    .setFooter({text:cfg.loja.nome}).setTimestamp();
  await i.followUp({embeds:[e],ephemeral:true});
};

// 🧩 Ações gerais (em desenvolvimento)
['btn:pedidos','btn:afiliar','btn:ajuda','btn:ganhos','btn:saque','btn:ind','btn:cupons','btn:relvendas','btn:afil','btn:cfg'].forEach(id=>{
  bot._acoes[id]=async(i)=>{await i.followUp({content:`⚙️ **${id}** — Em desenvolvimento! 🚀`,ephemeral:true})};
});

}; // ✅ FECHA MODULE.EXPORTS — NÃO APAGUE ESSA LINHA
