const { SlashCommandBuilder } = require('discord.js');
const ui = require('../../systems/ui');
module.exports = {
  data: new SlashCommandBuilder().setName('afiliarme').setDescription('🤝 Vire afiliado').addIntegerOption(o=>o.setName('porcentagem').setDescription('% comissão (padrão 5)').setRequired(false)),
  async executar(i, bot){
    const pc = Math.min(i.options.getInteger('porcentagem')||5,30);
    const a = bot.extras.criarAfiliado(i.user.id,i.user.username,pc);
    return i.editReply({embeds:[ui.embed('🤝 AFILIADO!',`✅ Seu código: \`${a.codigo}\`\n💸 ${a.porcentagem}% por venda\n\nCompartilhe e ganhe!`,'sucesso')]});
  }
};
