const qrcode = require('qrcode');
async function gerarPix(cfg, valor, pedidoId, comprador) {
  const chave = cfg.pix.chave, nome = String(cfg.pix.titular||'Minions Store LTDA').slice(0,25);
  const cidade = String(cfg.pix.cidade||'Salvador').slice(0,15).toUpperCase();
  const valorStr = Number(valor).toFixed(2), id = String(pedidoId).slice(0,25).replace(/\s+/g,'');
  const fmt = (id,v)=>`${String(id).padStart(2,'0')}${String(v.length).padStart(2,'0')}${v}`;
  const crc16 = s => { let p=0x1021,c=0xFFFF; for(let x of s){ let b=x.charCodeAt(0); c^=b<<8; for(let k=0;k<8;k++) c=(c&0x8000)?((c<<1)^p)&0xFFFF:(c<<1)&0xFFFF} return ((c^0xFFFF).toString(16).toUpperCase().padStart(4,'0')); };
  const payload = [fmt('00','01'),fmt('26',fmt('00','BR.GOV.BCB.PIX')+fmt('01',chave)),fmt('52','0000'),fmt('53','986'),fmt('54',valorStr),fmt('58','BR'),fmt('59',nome),fmt('60',cidade),fmt('62',fmt('05',id)),'6304'].join('');
  const final = payload + crc16(payload);
  const qr = await qrcode.toDataURL(final, {margin:1,width:300});
  return { payload:final, qr, valor:valorStr };
}
module.exports = { gerarPix };
