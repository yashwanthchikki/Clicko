const geoip = require('geoip-lite');

const getLocation = (ip) => {
  try {
    // Handle localhost and private IPs
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return {
        country: 'Local',
        region: 'Local',
        city: 'Local'
      };
    }
    
    const geo = geoip.lookup(ip);
    
    if (!geo) {
      return {
        country: 'Unknown',
        region: 'Unknown',
        city: 'Unknown'
      };
    }
    
    return {
      country: geo.country || 'Unknown',
      region: geo.region || 'Unknown',
      city: geo.city || 'Unknown'
    };
  } catch (error) {
    console.error('GeoIP error:', error);
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown'
    };
  }
};

module.exports = {
  getLocation
};
