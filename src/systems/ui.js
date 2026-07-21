const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

const CORES = {
  principal:'#FFD700',
  sucesso:'#00FF00',
  erro:'#FF0000',
  aviso:'#FFA500',
  info:'#00BFFF'
};

const ESTILOS = {
  Primary:ButtonStyle.Primary,
  Success:ButtonStyle.Success,
  Danger:ButtonStyle.Danger,
  Secondary:ButtonStyle.Secondary,
  Link:ButtonStyle.Link
};

module.exports = {
  CORES,
  ESTILOS,

  embed(titulo='', descricao='', tipo='principal', imagem=null){
    if(!titulo && !descricao) return new EmbedBuilder().setColor(CORES.principal);
    const e = new EmbedBuilder()
      .setColor(CORES[tipo]||CORES.principal)
      .setTimestamp();
    if(titulo) e.setTitle(titulo.slice(0,255));
    if(descricao) e.setDescription(descricao.slice(0,4000));
    if(imagem) try{ e.setImage(imagem) }catch(_){}
    return e;
  },

  linhas(...botoes){
    const linha = new ActionRowBuilder();
    botoes.slice(0,5).forEach(b => {
      if(!b || !b.id || !b.nome) return;
      const btn = new ButtonBuilder()
        .setCustomId(String(b.id))
        .setLabel(String(b.nome).slice(0,80))
        .setStyle(ESTILOS[b.estilo]||ButtonStyle.Primary);
      if(b.emoji) try{ btn.setEmoji(b.emoji) }catch(_){}
      if(b.url) btn.setURL(b.url);
      linha.addComponents(btn);
    });
    return linha;
  },

  modal(id, titulo, ...campos){
    const m = new ModalBuilder().setCustomId(String(id)).setTitle(String(titulo).slice(0,45));
    campos.slice(0,5).forEach(c => {
      if(!c || !c.id || !c.nome) return;
      const estilo = c.tipo==='Paragraph' ? TextInputStyle.Paragraph : TextInputStyle.Short;
      const input = new TextInputBuilder()
        .setCustomId(String(c.id))
        .setLabel(String(c.nome).slice(0,45))
        .setStyle(estilo)
        .setRequired(!!c.obrigatorio)
        .setMaxLength(c.tamanho||(estilo===TextInputStyle.Paragraph?3000:200));
      if(c.dica) input.setPlaceholder(String(c.dica).slice(0,100));
      if(c.valor) input.setValue(String(c.valor).slice(0,200));
      m.addComponents(new ActionRowBuilder().addComponents(input));
    });
    return m;
  }
};
