const express = require('express');
const app = express();
const PORTA = process.env.PORT || 3000;

app.get('/', (req,res)=>{
  res.send(`
    <html><head><title>Minions Store</title>
    <style>body{background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);color:#fff;font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center}
    div{padding:40px;border:3px solid #FFD700;border-radius:20px;background:rgba(0,0,0,0.3)}
    h1{color:#FFD700;font-size:48px;margin:0 0 20px}
    p{font-size:20px;color:#aaa;margin:10px 0}
    .online{color:#00FF00;font-weight:bold;font-size:24px;margin-top:20px}
    </style></head><body>
    <div><h1>💛 MINIONS STORE 💛</h1>
    <p>🤖 Bot: <strong>ONLINE</strong></p>
    <p>🏪 Sistema Enterprise: <strong>ATIVO</strong></p>
    <p>🔒 Servidor Autorizado: <strong>SIM</strong></p>
    <p class="online">✅ TUDO FUNCIONANDO PERFEITAMENTE!</p>
    </div></body></html>
  `);
});

app.get('/status', (req,res)=>res.json({status:'online',loja:'Minions Store',timestamp:new Date().toISOString()}));
app.get('/health', (req,res)=>res.send('OK'));

app.listen(PORTA, ()=>console.log(`🌐 Web online na porta ${PORTA}`));

module.exports = app;
