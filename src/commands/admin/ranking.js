const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ui = require('../../systems/ui');
module.exports = {
  data: new SlashCommandBuilder().setName('ranking').setDescription('🏆 Ranking clientes'),
  async executar(i, bot){
    if(!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.editReply({embeds:[ui.embed('❌ NEGADO','Só administradores','erro')]});
    const r = bot.extras.ranking();
    const txt = r.length ? r.map((x,idx)=>`**${idx+1}º** <@${x.id}> — **R$ ${x.v.toFixed(2)}**`).join('\n') : 'Nenhuma venda';
    return i.editReply({embeds:[ui.embed('🏆 RANKING TOP 10',txt,'principal')]});
  }
};
