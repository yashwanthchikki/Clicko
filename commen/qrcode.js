const QRCode = require('qrcode');

const generateQRCodeBuffer = async (url) => {
  if (!url) throw new Error('URL is required');
  console.log("have beeen hit ")
  try {
    const buffer = await QRCode.toBuffer(url, {
      type: 'png',
      margin: 1,
      color: { dark: '#000', light: '#fff' },
      width: 256
    });
    return buffer;
  } catch (err) {
    console.error('QR Code generation error:', err);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = generateQRCodeBuffer ;
