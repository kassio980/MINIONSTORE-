const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('comprar').setDescription('Comprar produto'),
  async execute(i, { bot }) {
    await i.deferReply({ ephemeral: true });
    const prods = bot._produtos?.length ? bot._produtos : [
      {id:'contas',nome:'🎮 Contas Premium',valor:49.90},{id:'diamantes',nome:'💎 Diamantes',valor:19.90},
      {id:'vip',nome:'👑 VIP 30 Dias',valor:29.90},{id:'gift20',nome:'🎁 Gift R$20',valor:20},
      {id:'gift50',nome:'🎁 Gift R$50',valor:50},{id:'curso',nome:'📚 Curso Completo',valor:97}
    ];
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId('menu:escolherproduto').setPlaceholder('🛒 Escolha seu produto')
        .addOptions(prods.slice(0,25).map(p => ({ label:p.nome.slice(0,25), description:`R$ ${Number(p.valor).toFixed(2)}`, value:p.id })))
    );
    await i.editReply({ content:'👇 Selecione o produto:', components:[menu] });
  }
};
