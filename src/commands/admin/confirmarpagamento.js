const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('confirmarpagamento').setDescription('[ADM] Confirmar pagamento').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(o => o.setName('pedido').setDescription('ID ex: PED123').setRequired(true))
    .addUserOption(o => o.setName('cliente').setDescription('Quem comprou').setRequired(true))
    .addStringOption(o => o.setName('produto').setDescription('Nome produto').setRequired(true))
    .addNumberOption(o => o.setName('valor').setDescription('Valor pago').setRequired(true)),
  async execute(i, { bot, config, comprovante }) {
    await i.deferReply({ ephemeral: true });
    const pedidoId = i.options.getString('pedido');
    const cliente = i.options.getUser('cliente');
    const produto = i.options.getString('produto');
    const valor = i.options.getNumber('valor');
    const { embed, anexoQr } = await comprovante.gerarComprovante({
      usuario: cliente.tag, produto, valor, pedidoId, status: 'PAGO',
      chavePix: config.pix.chave, titular: config.pix.titular
    });
    try {
      const entrega = new EmbedBuilder().setColor(config.cores.sucesso)
        .setTitle('🎉 PAGAMENTO CONFIRMADO!')
        .setDescription(`🛒 **Produto:** ${produto}\n💰 **Valor:** R$ ${valor.toFixed(2)}\n📦 **Pedido:** \`${pedidoId}\``)
        .addFields({name:'📦 Seu produto',value:'```Conteúdo: login/senha/link/arquivo```'})
        .setFooter({text:config.loja.nome}).setTimestamp();
      await cliente.send({ embeds:[entrega], files:[anexoQr] });
    } catch(e){ console.log('Privado:',e.message) }
    const ch = bot.channels.cache.find(c => c.name.includes('vendas')||c.name.includes('logs'));
    if(ch) ch.send({content:`✅ VENDA MANUAL por ${i.user}\n👤 ${cliente}\n🛒 ${produto}\n💰 R$ ${valor}\n📦 \`${pedidoId}\``, files:[anexoQr]});
    await i.editReply({content:`✅ Pedido \`${pedidoId}\` confirmado!\n👤 ${cliente}\n🛒 ${produto}\n💰 R$ ${valor}\n📨 Entregue no privado.`, files:[anexoQr]});
  }
};
