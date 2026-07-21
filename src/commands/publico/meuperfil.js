const { SlashCommandBuilder } = require('discord.js');
const ui = require('../../systems/ui');
const db = require('../../database');
module.exports = {
  data: new SlashCommandBuilder().setName('meuperfil').setDescription('👤 Seu perfil'),
  async executar(i, bot){
    const d = db.pegar();
    let u = d.usuarios.find(x=>x.id===i.user.id) || {nome:i.user.username,gastoTotal:0,vendas:0,nivel:1};
    const n = d.niveis.find(x=>x.id===u.nivel) || d.niveis[0];
    const p = d.pontos?.find(x=>x.usuarioId===i.user.id)?.saldo || 0;
    const prox = d.niveis.find(x=>x.id===u.nivel+1);
    return i.editReply({embeds:[ui.embed(`👤 ${i.user.username}`,
      `🎖️ Nível: **${n.nome}**\n💸 Desconto: **${n.desconto}%**\n💰 Gasto: **R$ ${(u.gastoTotal||0).toFixed(2)}**\n📦 Compras: **${u.vendas||0}**\n🪙 Pontos: **${p}**\n📈 Próximo: ${prox?`R$ ${(prox.minimo-(u.gastoTotal||0)).toFixed(2)}`:'✅ MÁXIMO'}`,
      'principal').setColor(n.cor).setThumbnail(i.user.displayAvatarURL({dynamic:true}))]});
  }
};
