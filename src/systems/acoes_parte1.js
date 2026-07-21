// ==========================================
// 🔌 TODAS AÇÕES SÃO REGISTRADAS AQUI (NUNCA MAIS CONFLITO!)
// ==========================================
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const db = require('../database');
const ui = require('./ui');

const BOTOES_LOJA = {
  abrir:{n:'VER OPÇÕES',e:'➡️',s:'Primary'},
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

module.exports = bot => {

// ==================== BOTÕES BÁSICOS ====================
bot._acoes['btn:inicio_voltar'] = async i => {
  const cmd = bot.comandos.get('inicio'); if(cmd) await cmd.executar(i,bot); return true;
};

bot._acoes['btn:btn_admin'] = async i => {
  if(!i.member.permissions.has('Administrator')){ await i.followUp({content:'❌ Só admins',ephemeral:true}).catch(()=>{}); return true; }
  const cmd = bot.comandos.get('paineladmin'); if(cmd) await cmd.executar(i,bot); return true;
};

bot._acoes['btn:ver_perfil'] = async i => {
  const cmd = bot.comandos.get('meuperfil'); if(cmd) await cmd.executar(i,bot); return true;
};

// ==================== LOJA: ABRIR MENU ====================
bot._acoes['btn:loja_abrir'] = async i => {
  const d = db.pegar();
  const prods = d.produtos.filter(p=>p.publicado && p.estoque>0).slice(0,25);
  if(!prods.length){ await i.followUp({content:'⚠️ Sem produtos',ephemeral:true}).catch(()=>{}); return true; }
  await i.followUp({
    content:'📦 Escolha um produto:',
    ephemeral:true,
    components:[{type:1,components:[{
      type:3,custom_id:'menu_prod',placeholder:'👇 Selecione',
      options: prods.map(p=>({label:p.nome.slice(0,95),value:`p_${p.id}`,description:`R$ ${parseFloat(p.preco).toFixed(2)} | Est:${p.estoque}`,emoji:{name:'📦'}}))
    }]}]
  }).catch(()=>{});
  return true;
};

// ==================== TICKETS: ABRIR / FECHAR ====================
bot._acoes['btn:abrir_ticket'] = async i => {
  const d = db.pegar();
  try{
    const ch = await i.guild.channels.create({
      name:`🎟️-${i.user.username}-${Date.now().toString().slice(-4)}`,
      type:ChannelType.GuildText,
      parent:d.config.canalTickets||null,
      permissionOverwrites:[
        {id:i.guild.id,deny:[PermissionFlagsBits.ViewChannel]},
        {id:i.user.id,allow:['ViewChannel','SendMessages','AttachFiles']},
        {id:d.config.cargoAtendente||i.guild.ownerId,allow:['ViewChannel','ManageMessages']}
      ]
    });
    if(!d.tickets) d.tickets=[];
    d.tickets.push({id:ch.id,usuario:i.user.id,usuarioNome:i.user.username,status:'ABERTO',data:new Date().toLocaleString('pt-BR')});
    db.salvar(d);
    await ch.send({embeds:[ui.embed('💬 ATENDIMENTO',`Olá ${i.user}! Em breve te atenderemos.`,'info')],components:[ui.linhas({id:'fechar_ticket',nome:'🔒 FECHAR',estilo:'Danger'})]});
    await i.followUp({content:`✅ Ticket: ${ch}`,ephemeral:true}).catch(()=>{});
  }catch(e){ await i.followUp({content:`❌ ${e.message}`,ephemeral:true}).catch(()=>{}) }
  return true;
};

bot._acoes['btn:fechar_ticket'] = async i => {
  if(!i.member.permissions.has('ManageChannels')){ await i.followUp({content:'❌ Sem permissão',ephemeral:true}).catch(()=>{}); return true; }
  const d = db.pegar(); const t = (d.tickets||[]).find(x=>x.id===i.channel.id);
  if(t) t.status='FECHADO'; db.salvar(d);
  await i.channel.delete().catch(()=>{});
  return true;
};

console.log('✅ Ações Parte 1 carregadas');
};
