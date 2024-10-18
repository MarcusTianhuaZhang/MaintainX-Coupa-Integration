//Configuration for webhook secrets and URLs and Coupa authoriztion 

module.exports = {
  coupa: {
    tokenUrl: process.env.COUPA_TOKEN_URL,
    poUrl: process.env.COUPA_PO_URL,
    orderLinesUrl: process.env.COUPA_ORDER_LINES_URL, // Add URL for order lines creation
    addressUrl: process.env.COUPA_ADDRESS_URL, // URL for address creation
    clientId: process.env.COUPA_CLIENT_ID,
    clientSecret: process.env.COUPA_CLIENT_SECRET,
  },
  maintainx: {
    webhookSecret: process.env.MAINTAINX_WEBHOOK_SECRET,
  },
};
