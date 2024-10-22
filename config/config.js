// config/config.js
module.exports = {
  coupa: {
    tokenUrl: process.env.COUPA_TOKEN_URL,
    poUrl: process.env.COUPA_PO_URL,
    orderLinesUrl: process.env.COUPA_ORDER_LINES_URL,
    addressUrl: process.env.COUPA_ADDRESS_URL,
    clientId: process.env.COUPA_CLIENT_ID,
    clientSecret: process.env.COUPA_CLIENT_SECRET,
  },
  maintainx: {
    webhookSecret_create: process.env.MAINTAINX_WEBHOOK_SECRET_CREATE,
    webhookSecret_create: process.env.MAINTAINX_WEBHOOK_SECRET_CHANGE,

  },
};
