const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const PRODUTOS = [
  { id:'contas', nome:'🎮 Contas Premium', valor:49.90 },
  { id:'diamantes', nome:'💎 Diamantes', valor:19.90 },
  { id:'vip', nome:'👑 VIP 30 Dias', valor:29.90 },
  { id:'gift20', nome:'🎁 Gift Card R$20', valor:20 },
  { id:'gift50', nome:'🎁 Gift Card R$50', valor:50 },
  { id:'curso', nome:'📚 Curso Completo', valor:97 }
];
module.exports = {
  data: new SlashCommandBuilder().setName('comprar').setDescription('Comprar produto na loja'),
  async execute(i) {
    await i.deferReply({ ephemeral: true });
    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder().setCustomId('menu:escolherproduto').setPlaceholder('🛒 Escolha seu produto')
        .addOptions(PRODUTOS.map(p => ({ label:p.nome, description:`R$ ${p.valor.toFixed(2)}`, value:p.id })))
    );
    await i.editReply({ content:'👇 Selecione o produto que deseja comprar:', components:[menu] });
  }
};
module.exports.PRODUTOS = PRODUTOS;
