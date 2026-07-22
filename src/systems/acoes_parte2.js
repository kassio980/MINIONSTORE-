module.exports = (bot) => {
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionFlagsBits, ChannelType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

// Produtos padrão
const PRODUTOS_PADRAO = [
  {id:'contas',nome:'🎮 Contas Premium',valor:49.90,estoque:999,desc:'Contas garantidas',midia:''},
  {id:'diamantes',nome:'💎 Diamantes',valor:19.90,estoque:999,desc:'Entrega imediata',midia:''},
  {id:'vip',nome:'👑 VIP 30 Dias',valor:29.90,estoque:999,desc:'VIP por 30 dias',midia:''},
  {id:'gift20',nome:'🎁 Gift R$20',valor:20,estoque:999,desc:'Gift R$20',midia:''},
  {id:'gift50',nome:'🎁 Gift R$50',valor:50,estoque:999,desc:'Gift R$50',midia:''},
  {id:'curso',nome:'📚 Curso Completo',valor:97,estoque:999,desc:'Curso completo',midia:''}
];
bot._produtos = bot._produtos?.length ? bot._produtos : PRODUTOS_PADRAO;
bot._botoesCfg = bot._botoesCfg || {}; // Guarda personalização dos botões

// ==============================================
// ✅ TODOS OS BOTÕES DO PAINEL ADMIN (SEUS ERROS AQUI)
// ==============================================
bot._acoes['btn:abrircadproduto'] = async (i) => {
  const m = new ModalBuilder().setCustomId('modal:cadproduto').setTitle('➕ NOVO PRODUTO');
  m.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('✅ Nome').setStyle(1).setRequired(true).setMaxLength(60)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('preco').setLabel('💰 Preço ex:29.90').setStyle(1).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('est').setLabel('📦 Estoque').setStyle(1).setValue('999').setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('desc').setLabel('📝 Descrição').setStyle(2).setRequired(true).setMaxLength(500)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('midia').setLabel('📷 LINK FOTO/VIDEO').setStyle(1).setRequired(false))
  );
  await i.showModal(m);
};

bot._acoes['btn:abrircriarcupom'] = async (i) => {
  const m = new ModalBuilder().setCustomId('modal:criarcupom').setTitle('🎟️ CRIAR CUPOM');
  m.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cod').setLabel('Código ex:MINIONS10').setStyle(1).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('pct').setLabel('% 1-100').setStyle(1).setValue('10').setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('usos').setLabel('Usos').setStyle(1).setValue('100').setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('dias').setLabel('Dias').setStyle(1).setValue('30').setRequired(true))
  );
  await i.showModal(m);
};

bot._acoes['btn:abrirtgift'] = async (i) => {
  const m = new ModalBuilder().setCustomId('modal:giftcard').setTitle('💳 GIFT CARD');
  m.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('valor').setLabel('Valor ex:50.00').setStyle(1).setRequired(true)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('qtd').setLabel('Quantidade').setStyle(1).setValue('1').setRequired(true))
  );
  await i.showModal(m);
};

bot._acoes['btn:relvendas'] = async (i) => {
  const total = Object.values(bot._pedidos||{}).filter(p=>p.status==='PAGO').reduce((s,p)=>s+Number(p.valor),0);
  const qtd = Object.values(bot._pedidos||{}).filter(p=>p.status==='PAGO').length;
  const e = new EmbedBuilder().setColor('#3b82f6').setTitle('📊 RELATÓRIO DE VENDAS')
    .addFields({name:'💰 Total',value:`R$ ${total.toFixed(2)}`,inline:true},{name:'🛒 Vendas',value:`${qtd}`,inline:true},{name:'⏳ Pendentes',value:`${Object.values(bot._pedidos||{}).filter(p=>p.status==='AGUARDANDO').length}`,inline:true});
  await i.followUp({embeds:[e],ephemeral:true});
};

bot._acoes['btn:afil'] = async (i) => {
  await i.followUp({content:'👥 **Afiliados**\nUse `/afiliarme` para virar afiliado e ganhar 10% de comissão!',ephemeral:true});
};

bot._acoes['btn:cfg'] = async (i) => {
  const e = new EmbedBuilder().setColor('#dc2626').setTitle('⚙️ CONFIGURAÇÕES')
    .setDescription('Ajuste o sistema da loja:\n\n✅ **/configbotoes** → Personalizar botões\n✅ **/configloja** → Dados da loja\n✅ **/configpix** → Chave PIX');
  await i.followUp({embeds:[e],ephemeral:true});
};

// ==============================================
// ✅ BOTÕES DO TICKET
// ==============================================
bot._acoes['btn:abrirticket'] = async (i) => {
  const cfg=bot.config, g=i.guild;
  let cat = g.channels.cache.find(c=>c.type===ChannelType.GuildCategory && c.name.toLowerCase().includes('ticket'));
  if(!cat) cat = await g.channels.create({name:'🎫 TICKETS',type:ChannelType.GuildCategory});
  const ch = await g.channels.create({
    name:`ticket-${i.user.username}`,type:ChannelType.GuildText,parent:cat.id,
    permissionOverwrites:[
      {id:g.id,deny:['ViewChannel']},
      {id:i.user.id,allow:['ViewChannel','SendMessages','AttachFiles','EmbedLinks']},
      {id:cfg.cargos?.admin||'1505876225946812440',allow:['ViewChannel','SendMessages','ManageMessages']}
    ]
  });
  bot._tickets[ch.id]={usuario:i.user.id};
  const e=new EmbedBuilder().setColor(cfg.cores.info).setTitle(`🎫 Ticket #${ch.name.split('-')[1]}`)
    .setDescription(`Olá ${i.user}!\n\n**📷 Você pode enviar FOTOS e VÍDEOS aqui.**\n\nDescreva seu problema:`);
  const b=new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`btn:fecharticket:${ch.id}`).setLabel('🔒 Fechar').setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId(`btn:chamaradm:${ch.id}`).setLabel('👥 Chamar Equipe').setStyle(ButtonStyle.Primary)
  );
  await ch.send({content:`${i.user} <@&${cfg.cargos?.admin||'1505876225946812440'}>`,embeds:[e],components:[b]});
  await i.followUp({content:`✅ Ticket: ${ch}`,ephemeral:true});
};

bot._acoes['btn:abrirticketreal'] = bot._acoes['btn:abrirticket']; // Ambos os IDs funcionam

bot._acoes['btn:fecharticket_*'] = async (i) => {
  const id=i.customId.split(':').slice(2).join(':');
  const t=bot._tickets[id];
  if(!i.member.permissions.has(PermissionFlagsBits.ManageChannels) && t?.usuario!==i.user.id)
    return i.followUp({content:'🚫 Só ADM/dono',ephemeral:true});
  await i.channel.send('🔒 Fechando em 5s...');
  setTimeout(()=>i.channel.delete().catch(()=>{}),5000);
};

bot._acoes['btn:chamaradm_*'] = async (i) => {
  const cfg=bot.config;
  await i.channel.send(`⚠️ ${i.user} chamou equipe! <@&${cfg.cargos?.admin||'1505876225946812440'}>`);
};

bot._acoes['btn:regras'] = async (i) => {
  const e=new EmbedBuilder().setColor(bot.config.cores.aviso).setTitle('📜 REGRAS')
    .setDescription('1️⃣ Chargeback = BAN\n2️⃣ Só PIX\n3️⃣ Não compartilhe produto\n4️⃣ Respeite a equipe');
  await i.followUp({embeds:[e],ephemeral:true});
};

// ==============================================
// ✅ MODAIS
// ==============================================
bot._acoes['modal:cadproduto'] = async (i) => {
  if(!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.reply({content:'🚫 Só ADM',ephemeral:true});
  const nome=i.fields.getTextInputValue('nome'), preco=parseFloat(i.fields.getTextInputValue('preco'));
  const est=parseInt(i.fields.getTextInputValue('est'))||999, desc=i.fields.getTextInputValue('desc'), midia=i.fields.getTextInputValue('midia')||'';
  if(isNaN(preco)) return i.reply({content:'❌ Preço inválido',ephemeral:true});
  const novo={id:'prod'+Date.now(),nome,valor:preco,estoque:est,desc,midia}; bot._produtos.push(novo);
  const e=new EmbedBuilder().setColor('#10b981').setTitle('✅ PRODUTO CADASTRADO')
    .addFields({name:'Nome',value:nome,inline:true},{name:'Preço',value:`R$ ${preco.toFixed(2)}`,inline:true},{name:'Mídia',value:midia||'Sem foto'});
  if(midia) e.setImage(midia);
  await i.reply({embeds:[e],ephemeral:true});
};

bot._acoes['modal:criarcupom'] = async (i) => {
  const cod=i.fields.getTextInputValue('cod').toUpperCase(), pct=parseInt(i.fields.getTextInputValue('pct'));
  const e=new EmbedBuilder().setColor('#3b82f6').setTitle('🎟️ CUPOM').addFields({name:'Código',value:`\`${cod}\``,inline:true},{name:'%',value:`${pct}%`,inline:true});
  await i.reply({embeds:[e],ephemeral:true});
};

bot._acoes['modal:giftcard'] = async (i) => {
  const valor=parseFloat(i.fields.getTextInputValue('valor')), qtd=parseInt(i.fields.getTextInputValue('qtd'));
  const cods=Array.from({length:qtd},()=>'GIFT-'+Math.random().toString(36).slice(2,8).toUpperCase());
  await i.reply({content:`💳 **${qtd}x Gift R$ ${valor.toFixed(2)}:**\n\`\`\`${cods.join('\n')}\`\`\``,ephemeral:true});
};

// ==============================================
// ✅ PIX / VENDAS
// ==============================================
bot._acoes['menu:escolherproduto'] = async (i) => {
  const p = bot._produtos.find(x=>x.id===i.values[0]) || PRODUTOS_PADRAO.find(x=>x.id===i.values[0]);
  if(!p) return i.followUp({content:'❌ Produto não encontrado',ephemeral:true});
  const cfg=bot.config, pid=`PED${Date.now()}`;
  const {payload,valor}=await bot.pix.gerarPix(cfg,p.valor,pid,i.user.tag);
  bot._pedidos[pid]={id:pid,usuario:i.user.id,usuarioTag:i.user.tag,produto:p.nome,valor,status:'AGUARDANDO',pixPayload:payload,midia:p.midia||''};
  const {embed,anexoQr}=await bot.comprovante.gerarComprovante({usuario:i.user.tag,produto:p.nome,valor,pedidoId:pid,status:'AGUARDANDO',chavePix:cfg.pix.chave,titular:cfg.pix.titular,pixPayload:payload});
  embed.addFields({name:'📋 Copia e Cola',value:`\`\`\`${payload}\`\`\``});
  if(p.midia) embed.setImage(p.midia);
  const b=new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`btn:pixcopiar:${pid}`).setLabel('📋 Copiar').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`btn:admpagar:${pid}`).setLabel('✅ ADM Confirmar').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`btn:pixcancelar:${pid}`).setLabel('❌ Cancelar').setStyle(ButtonStyle.Danger)
  );
  await i.update({content:'',embeds:[embed],files:[anexoQr],components:[b]});
};

bot._acoes['btn:pixcopiar_*'] = async (i) => {
  const id=i.customId.split(':').slice(2).join(':'), ped=bot._pedidos[id];
  if(!ped) return i.followUp({content:'❌ Não encontrado',ephemeral:true});
  await i.followUp({content:`📋 **PIX:**\n\`\`\`${ped.pixPayload}\`\`\``,ephemeral:true});
};

bot._acoes['btn:admpagar_*'] = async (i) => {
  const id=i.customId.split(':').slice(2).join(':');
  if(!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.followUp({content:'🚫 SÓ ADM!',ephemeral:true});
  const ped=bot._pedidos[id]; if(!ped||ped.status==='PAGO') return i.followUp({content:ped?'⚠️ Já pago':'❌ Não encontrado',ephemeral:true});
  ped.status='PAGO';
  const cfg=bot.config;
  const {embed,anexoQr}=await bot.comprovante.gerarComprovante({usuario:ped.usuarioTag,produto:ped.produto,valor:ped.valor,pedidoId:id,status:'PAGO',chavePix:cfg.pix.chave,titular:cfg.pix.titular,pixPayload:ped.pixPayload});
  if(ped.midia) embed.setImage(ped.midia);
  await i.message.edit({embeds:[embed],files:[anexoQr],components:[]});
  try{
    const cli=await bot.users.fetch(ped.usuario);
    const ent=new EmbedBuilder().setColor(cfg.cores.sucesso).setTitle('🎉 APROVADO!')
      .setDescription(`${ped.produto}\nR$ ${Number(ped.valor).toFixed(2)}\n\`${id}\``)
      .addFields({name:'📦 Conteúdo',value:'```login / senha / link```'});
    if(ped.midia) ent.setImage(ped.midia);
    await cli.send({embeds:[ent],files:[anexoQr]});
  }catch(e){}
  await i.followUp({content:`✅ \`${id}\` PAGO!`,ephemeral:true});
};

bot._acoes['btn:pixcancelar_*'] = async (i) => {
  const id=i.customId.split(':').slice(2).join(':'), ped=bot._pedidos[id]; if(!ped) return;
  if(i.user.id!==ped.usuario && !i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.followUp({content:'🚫',ephemeral:true});
  ped.status='CANCELADO'; await i.message.delete().catch(()=>{});
  await i.followUp({content:`❌ \`${id}\` cancelado.`,ephemeral:true});
};

bot._acoes['btn:abrirmenucomprar'] = async (i) => {
  const m=new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('menu:escolherproduto').setPlaceholder('🛒 Escolha')
    .addOptions(bot._produtos.slice(0,25).map(p=>({label:p.nome.slice(0,25),description:`R$ ${Number(p.valor).toFixed(2)}`,value:p.id}))));
  await i.followUp({content:'👇 Produto:',components:[m],ephemeral:true});
};

bot._acoes['menu:cats'] = bot._acoes['btn:abrirmenucomprar'];

// Outros botões
['btn:pedidos','btn:afiliar','btn:ajuda','btn:ganhos','btn:saque','btn:ind','btn:cupons'].forEach(id=>{
  bot._acoes[id]=async(i)=>{await i.followUp({content:`⚙️ **${id}** — em desenvolvimento!`,ephemeral:true})};
});

}; // FIM

// ==============================================
// 🎨 SISTEMA DE PERSONALIZAR BOTÕES
// ==============================================
const BOTOES_DISPONIVEIS = [
  {id:'btn:abrircadproduto',nome:'➕ Cadastrar Produto',cor:3,emoji:'➕'},
  {id:'btn:abrircriarcupom',nome:'🎟️ Criar Cupom',cor:1,emoji:'🎟️'},
  {id:'btn:abrirtgift',nome:'💳 Gift Card',cor:2,emoji:'💳'},
  {id:'btn:relvendas',nome:'📊 Relatório Vendas',cor:1,emoji:'📊'},
  {id:'btn:afil',nome:'👥 Afiliados',cor:2,emoji:'👥'},
  {id:'btn:cfg',nome:'⚙️ Configurações',cor:4,emoji:'⚙️'},
  {id:'btn:abrirticket',nome:'📩 Abrir Ticket',cor:3,emoji:'📩'},
  {id:'btn:abrirmenucomprar',nome:'🛒 Comprar',cor:3,emoji:'🛒'}
];

bot._acoes['menu:editarbotao'] = async (i) => {
  const bid = i.values[0];
  const padrao = BOTOES_DISPONIVEIS.find(b=>b.id===bid);
  const atual = bot._botoesCfg[bid] || {};
  const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
  const m = new ModalBuilder().setCustomId(`modal:editbotao:${bid}`).setTitle(`🎨 Editar: ${padrao.nome}`);
  m.addComponents(
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('nome').setLabel('Texto do botão').setStyle(1).setValue(atual.nome||padrao.nome).setRequired(true).setMaxLength(40)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('emoji').setLabel('Emoji (opcional)').setStyle(1).setValue(atual.emoji||padrao.emoji||'').setRequired(false).setMaxLength(4)),
    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cor').setLabel('Cor: 1=Azul 2=Cinza 3=Verde 4=Vermelho').setStyle(1).setValue(String(atual.cor||padrao.cor)).setRequired(true).setMaxLength(1))
  );
  await i.showModal(m);
};

bot._acoes['modal:editbotao_*'] = async (i) => {
  const bid = i.customId.split(':').slice(2).join(':');
  const nome = i.fields.getTextInputValue('nome').trim();
  const emoji = i.fields.getTextInputValue('emoji').trim();
  let cor = parseInt(i.fields.getTextInputValue('cor'));
  if(![1,2,3,4].includes(cor)) cor = 3;
  bot._botoesCfg[bid] = { nome, emoji, cor };
  await i.reply({content:`✅ **Botão atualizado!**\n\n\`${bid}\`\n**Texto:** ${emoji} ${nome}\n**Cor:** ${['','Azul','Cinza','Verde','Vermelho'][cor]}`,ephemeral:true});
};

bot._acoes['btn:resetarbotoes'] = async (i) => {
  bot._botoesCfg = {};
  await i.followUp({content:'🔄 Todos botões resetados para o padrão!',ephemeral:true});
};

// ✅ Função GLOBAL para criar botão personalizado (usada no painel e loja)
bot.criarBotao = function(id) {
  const padrao = BOTOES_DISPONIVEIS.find(b=>b.id===id) || {nome:id,cor:2,emoji:''};
  const cfg = this._botoesCfg[id] || {};
  return new ButtonBuilder()
    .setCustomId(id)
    .setLabel(`${cfg.emoji||padrao.emoji?cfg.emoji||padrao.emoji+' ':''}${cfg.nome||padrao.nome}`.trim())
    .setStyle(cfg.cor||padrao.cor);
};
