module.exports = {
  bot: {
    token: process.env.BOT_TOKEN,
    clientId: process.env.BOT_CLIENT_ID
  },
  cores: {
    principal: 0xFFD700,
    sucesso: 0x10B981,
    erro: 0xFF3333,
    info: 0x3B82F6,
    aviso: 0xF59E0B
  },
  pix: {
    chave: process.env.PIX_CHAVE || "COLOQUE_SUA_CHAVE_NO_RENDER",
    titular: process.env.PIX_TITULAR || "Minions Store LTDA",
    cidade: "Salvador - BA"
  },
  loja: {
    nome: "Minions Store",
    dominio: "minionstore.onrender.com",
    garantiaPadrao: "30 dias",
    fretePadrao: "Grátis para todo Brasil"
  }
}
