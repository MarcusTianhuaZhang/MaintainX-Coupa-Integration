const express = require('express');
const bodyParser = require('body-parser');
const {
  handlePurchaseOrderWebhook,
  handlePurchaseOrderChangeWebhook,
  handlePurchaseOrderStatusChangeWebhook,
} = require('./controllers/maintainx');
const config = require('./config/config');

const app = express();
app.use(bodyParser.json());

// Webhook route for Purchase Order creation
app.post('/api/purchase-order', handlePurchaseOrderWebhook);

// Webhook route for Purchase Order Change
app.post('/api/purchase-order-change', handlePurchaseOrderChangeWebhook);

// Webhook route for Purchase Order Status Change
app.post('/api/purchase-order-status-change', handlePurchaseOrderChangeWebhook);

// Start the server
const port = 80; 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
