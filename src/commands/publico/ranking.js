const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
  data: new SlashCommandBuilder().setName('ranking').setDescription('Ranking top afiliados'),
  async execute(i, { config, db }) {
    await i.deferReply();
    const lista = (await db?.getRankingAfiliados?.()) || [];
    const top = lista.slice(0,5);
    const m = ['🥇','🥈','🥉','4️⃣','5️⃣'];
    const txt = top.length ? top.map((x,idx)=>`${m[idx]} <@${x.id}> → **R$ ${parseFloat(x.total||0).toFixed(2)}** (${x.vendas||0} vendas)`).join('\n') : '📭 Ainda ninguém no ranking — seja o primeiro!';
    const e = new EmbedBuilder().setColor(config.cores.aviso).setTitle('🏆 RANKING DE AFILIADOS').setDescription(txt).setFooter({text:'Atualizado a cada 1 hora'}).setTimestamp();
    await i.editReply({ embeds:[e] });
  }
};
