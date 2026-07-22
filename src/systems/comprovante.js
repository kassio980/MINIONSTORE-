const qrcode = require('qrcode');
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
async function gerarComprovante(dados) {
  const qrBuf = await qrcode.toBuffer(dados.pixPayload||dados.chavePix, {width:256,margin:1});
  const anexoQr = new AttachmentBuilder(qrBuf, {name:'qrcode.png'});
  const cor = dados.status==='PAGO' ? '#10b981' : '#f59e0b';
  const embed = new EmbedBuilder().setColor(cor)
    .setTitle(dados.status==='PAGO' ? '✅ COMPROVANTE DE PAGAMENTO' : '⏳ PAGAMENTO PENDENTE')
    .setDescription('💛 **MINIONS STORE OFICIAL** 💛\n🇧🇷 A melhor loja do Brasil')
    .addFields(
      {name:'👤 Cliente',value:String(dados.usuario).slice(0,32),inline:true},
      {name:'🛒 Produto',value:String(dados.produto).slice(0,32),inline:true},
      {name:'💰 Valor',value:`R$ ${Number(dados.valor).toFixed(2)}`,inline:true},
      {name:'📦 Pedido',value:`#${dados.pedidoId}`,inline:true},
      {name:'🏦 Chave PIX',value:`\`${dados.chavePix}\``,inline:false},
      {name:'👤 Titular',value:String(dados.titular).slice(0,32),inline:true},
      {name:'📅 Data/Hora',value:new Date().toLocaleString('pt-BR'),inline:true}
    ).setThumbnail('attachment://qrcode.png').setFooter({text:'💛 Minions Store • Oficial'}).setTimestamp();
  return { embed, anexoQr };
}
module.exports = { gerarComprovante };
