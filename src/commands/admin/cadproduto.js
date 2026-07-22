const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ui = require('../../systems/ui');
module.exports = {
  data: new SlashCommandBuilder().setName('cadproduto').setDescription('➕ Cadastrar produto'),
  async executar(i, bot){
    if(!i.member.permissions.has(PermissionFlagsBits.Administrator)) return i.editReply({embeds:[ui.embed('❌ NEGADO','Só administradores','erro')]});
    return i.showModal(ui.modal('modal_cadprod','NOVO PRODUTO',
      {id:'nome',nome:'Nome',obrigatorio:true},{id:'desc',nome:'Descrição',tipo:'Paragraph',obrigatorio:true},
      {id:'preco',nome:'Preço R$',obrigatorio:true},{id:'estoque',nome:'Estoque',obrigatorio:false},{id:'imagem',nome:'URL Imagem',obrigatorio:false}
    ));
  }
};
