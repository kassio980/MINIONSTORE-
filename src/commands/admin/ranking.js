const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Comando do sistema'),

  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;

    // === SEU CÓDIGO ORIGINAL ABAIXO ===
const { SlashCommandBuilder } = require('discord.js');

  data: new SlashCommandBuilder()
    .setName('ranking')
    .setDescription('Comando do sistema'),

  async execute(interaction, dados) {
    const { bot, config, db, ui, extras, gerImg, lb } = dados;

    // === SEU CÓDIGO ORIGINAL ABAIXO ===
const { SlashCommandBuilder } = require('discord.js');
const ui = require('../../systems/ui');
  data: new SlashCommandBuilder().setName('ranking').setDescription('🏆 Ranking clientes'),
  async executar(i, bot){
    const r = bot.extras.ranking();
    const txt = r.length ? r.map((x,idx)=>`**${idx+1}º** <@${x.id}> — **R$ ${x.v.toFixed(2)}**`).join('\n') : 'Nenhuma venda';
    return i.editReply({embeds:[ui.embed('🏆 RANKING TOP 10',txt,'principal')]});
  }
};
  }
};
  }
};
