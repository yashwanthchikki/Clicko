const QRCode = require('qrcode');

const generateQRCode = async (url, options = {}) => {
  try {
    const defaultOptions = {
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    };
    
    const qrOptions = { ...defaultOptions, ...options };
    const qrCodeDataURL = await QRCode.toDataURL(url, qrOptions);
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

const generateQRCodeBuffer = async (url, options = {}) => {
  try {
    const defaultOptions = {
      type: 'png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    };
    
    const qrOptions = { ...defaultOptions, ...options };
    const qrCodeBuffer = await QRCode.toBuffer(url, qrOptions);
    
    return qrCodeBuffer;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};

module.exports = {
  generateQRCode,
  generateQRCodeBuffer
};
