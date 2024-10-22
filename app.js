const express = require('express');
const bodyParser = require('body-parser');
const {
  purchaseOrderCreationWebhookController,
  purchaseOrderChangeWebhookController,
} = require('./controllers/maintainxController');
const config = require('./config/config');

const app = express();
app.use(bodyParser.json());

// Webhook route for Purchase Order creation
app.post('/api/purchase-order', purchaseOrderCreationWebhookController);

// Webhook route for Purchase Order Change
app.post('/api/purchase-order-change', purchaseOrderChangeWebhookController);

// Webhook route for Purchase Order Status Change
app.post('/api/purchase-order-status-change', purchaseOrderChangeWebhookController);

// Start the server
const port = 80; 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
