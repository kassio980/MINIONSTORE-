const qrcode = require('qrcode');

/**
 * Gera payload PIX padrão Bacen + QR Code
 * @param {object} cfg - config.loja + config.pix
 * @param {number} valor - R$ 29.90
 * @param {string} pedidoId - ex: PED-1234
 * @param {string} comprador - nome Discord
 * @returns {Promise<{payload:string, qr:string, valor:string}>}
 */
async function gerarPix(cfg, valor, pedidoId, comprador) {
  const chave = cfg.pix.chave;
  const nome = (cfg.pix.titular || 'Minions Store LTDA').slice(0,25);
  const cidade = (cfg.pix.cidade || 'Salvador').slice(0,15).toUpperCase();
  const valorStr = Number(valor).toFixed(2);
  const id = String(pedidoId).slice(0,25).replace(/\s+/g,'');

  // Funções auxiliares padrão PIX
  const fmt = (id, val) => `${String(id).padStart(2,'0')}${String(val.length).padStart(2,'0')}${val}`;
  const crc16 = (str) => {
    let pol = 0x1021, crc = 0xFFFF;
    for(let c of str){ let b = c.charCodeAt(0); crc ^= b<<8; for(let i=0;i<8;i++){ crc = (crc & 0x8000) ? ((crc<<1)^pol) & 0xFFFF : (crc<<1) & 0xFFFF } }
    return ((crc^0xFFFF).toString(16).toUpperCase().padStart(4,'0'));
  };

  // Monta payload
  const payload = [
    fmt('00','01'), fmt('26', fmt('00','BR.GOV.BCB.PIX') + fmt('01',chave)),
    fmt('52','0000'), fmt('53','986'), fmt('54', valorStr),
    fmt('58','BR'), fmt('59', nome), fmt('60', cidade),
    fmt('62', fmt('05', id)), '6304'
  ].join('');
  const final = payload + crc16(payload);

  // Gera QR Code em data URL (imagem png em base64)
  const qr = await qrcode.toDataURL(final, { margin: 1, width: 300, color: { dark:'#000000', light:'#FFFFFF' } });

  return { payload: final, qr, valor: valorStr };
}

module.exports = { gerarPix };
