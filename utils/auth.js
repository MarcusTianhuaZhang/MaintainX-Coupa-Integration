//Handles Coupa's OAuth authentication to get an access token.
const axios = require('axios');
const qs = require('qs');
const config = require('../config/config');

async function getCoupaAccessToken() {
  const tokenUrl = config.coupa.tokenUrl;
  const clientId = config.coupa.clientId;
  const clientSecret = config.coupa.clientSecret;

  const data = {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'purchase_orders.read purchase_orders.write', // Example of required scopes
  };

  try {
    const response = await axios.post(tokenUrl, qs.stringify(data), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error retrieving Coupa access token:', error.response?.data || error.message);
    throw new Error('Failed to retrieve Coupa access token.');
  }
}

module.exports = { getCoupaAccessToken };
