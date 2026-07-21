const fs = require('fs');
const path = require('path');
const ARQUIVO = path.join(__dirname,'..','banco.json');

const PADRAO = {
  produtos:[], usuarios:[], pedidos:[], tickets:[], cupons:[], afiliados:[], giftcards:[],
  layouts:[], botoes:[], logsAuditoria:[],
  niveis:[
    {id:1,nome:'Cliente',cor:'#AAAAAA',desconto:0,minimo:0},
    {id:2,nome:'Bronze',cor:'#CD7F32',desconto:3,minimo:100},
    {id:3,nome:'Prata',cor:'#C0C0C0',desconto:5,minimo:300},
    {id:4,nome:'Ouro',cor:'#FFD700',desconto:8,minimo:700},
    {id:5,nome:'Diamante',cor:'#00BFFF',desconto:12,minimo:1500},
    {id:6,nome:'Minion Master',cor:'#FF00FF',desconto:20,minimo:5000}
  ],
  estatisticas:{totalVendas:0,valorTotal:0,primeiraVenda:null,ultimaVenda:null},
  config:{
    blackFriday:false, modoManutencao:false,
    canalTickets:null, cargoAtendente:null, canalComprovantes:null,
    pix:{chave:'',titular:'',cidade:''}
  }
};

function carregar(){
  try{
    if(!fs.existsSync(ARQUIVO)){ salvar(PADRAO); return JSON.parse(JSON.stringify(PADRAO)); }
    const d = JSON.parse(fs.readFileSync(ARQUIVO,'utf8'));
    // Garante que TUDO existe (nunca mais null)
    Object.keys(PADRAO).forEach(k => { if(d[k]===undefined || d[k]===null) d[k] = JSON.parse(JSON.stringify(PADRAO[k])); });
    if(!d.config) d.config = {...PADRAO.config};
    return d;
  }catch(e){ return JSON.parse(JSON.stringify(PADRAO)); }
}

function salvar(dados){
  try{
    const pasta = path.dirname(ARQUIVO);
    if(!fs.existsSync(pasta)) fs.mkdirSync(pasta,{recursive:true});
    fs.writeFileSync(ARQUIVO, JSON.stringify(dados,null,2));
    return true;
  }catch(e){ return false; }
}

module.exports = {
  pegar: carregar,
  salvar,
  reset: () => salvar(PADRAO),
  logAdmin(adminId,adminNome,acao,detalhes=''){
    const d = carregar();
    d.logsAuditoria.unshift({data:new Date().toLocaleString('pt-BR'),adminId,adminNome,acao,detalhes});
    if(d.logsAuditoria.length>200) d.logsAuditoria = d.logsAuditoria.slice(0,200);
    salvar(d);
  }
};
