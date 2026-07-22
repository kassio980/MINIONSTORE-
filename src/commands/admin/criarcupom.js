const { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('criarcupom').setDescription('Criar cupom').setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(i) {
    const m = new ModalBuilder().setCustomId('modal:criarcupom').setTitle('🎟️ CRIAR CUPOM');
    m.addComponents(
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('cod').setLabel('Código ex: MINIONS10').setStyle(TextInputStyle.Short).setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('pct').setLabel('% Desconto 1-100').setStyle(TextInputStyle.Short).setValue('10').setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('usos').setLabel('Usos máximos').setStyle(TextInputStyle.Short).setValue('100').setRequired(true)),
      new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('dias').setLabel('Validade dias').setStyle(TextInputStyle.Short).setValue('30').setRequired(true))
    );
    await i.showModal(m);
  }
};
