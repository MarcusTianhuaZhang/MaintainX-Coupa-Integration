const {
  createCoupaAddress,
  createCoupaOrderLines,
  createCoupaPurchaseOrder,
  updateCoupaPurchaseOrder,
  uploadPOAttachments,
} = require('./coupa');

const {
  mapMaintainXToCoupaOrderLines,
  mapMaintainXToCoupaPO,
  mapMaintainXToCoupaPOChange,
  mapMaintainXToCoupaPOStatus,
  mapMaintainXToCoupaAddress
} = require('../utils/mapper');

const { validateWebhookSignature } = require('../utils/validator');



async function handlePurchaseOrderWebhook(req, res) {
  const isValid = validateWebhookSignature(req.headers, req.body, `${req.protocol}://${req.get('host')}${req.originalUrl}`);
  if (!isValid) return res.status(400).send('Invalid signature');

  const maintainXData = req.body;

  // Step 1: Map and create Coupa address
  const coupaAddressData = mapMaintainXToCoupaAddress(maintainXData.newPurchaseOrder.shippingAddress);
  
  try {
    const addressId = await createCoupaAddress(coupaAddressData);  // Create the address and get its ID

    // Step 2: Map and create Coupa order lines
    const coupaOrderLinesData = mapMaintainXToCoupaOrderLines(maintainXData.newPurchaseOrder.items);
    const createdOrderLines = await createCoupaOrderLines(coupaOrderLinesData);  // Create the order lines and get their IDs

    const orderLineIds = createdOrderLines.map(line => line.id);

    // Step 3: Map and create the Purchase Order in Coupa with the created order line IDs and address ID
    const coupaPOData = mapMaintainXToCoupaPO(maintainXData, orderLineIds, addressId);
    const poId = await createCoupaPurchaseOrder(coupaPOData, orderLineIds, addressId);

    // Step 4: Handle attachments
    const attachments = maintainXData.newPurchaseOrder.attachments || [];
    await uploadPOAttachments(attachments, poId);

    res.status(200).send('Purchase Order and attachments synced successfully');
  } catch (error) {
    console.error('Error syncing Purchase Order:', error);
    res.status(500).send('Failed to sync Purchase Order');
  }


// Handle Purchase Order Change Webhook
async function handlePurchaseOrderChangeWebhook(req, res) {
  const isValid = validateWebhookSignature(req.headers, req.body, `${req.protocol}://${req.get('host')}${req.originalUrl}`);

  if (!isValid) {
    return res.status(400).send('Invalid webhook signature');
  }

  const maintainXData = req.body;
  const orderId = maintainXData.orderId;

  const updateData = mapMaintainXToCoupaPO(maintainXData);

  try {
    await updateCoupaPurchaseOrder(orderId, updateData);
    res.status(200).send('Purchase Order updated successfully.');
  } catch (error) {
    console.error('Error updating Purchase Order:', error);
    res.status(500).send('Failed to update Purchase Order.');
  }
}

// Handle Purchase Order Status Change Webhook
async function handlePurchaseOrderStatusChangeWebhook(req, res) {
  const isValid = validateWebhookSignature(req.headers, req.body, `${req.protocol}://${req.get('host')}${req.originalUrl}`);

  if (!isValid) {
    return res.status(400).send('Invalid signature');
  }

  const maintainXData = req.body;
  const orderId = maintainXData.orderId; // Assuming orderId is provided in the webhook payload
  
  const statusUpdate = {
    status: maintainXData.status,
    // Map other necessary fields if required
  };

  try {
    await updateCoupaPurchaseOrder(orderId, statusUpdate);
    res.status(200).send('Purchase Order Status Change processed successfully');
  } catch (error) {
    console.error('Error processing Purchase Order Status Change:', error);
    res.status(500).send('Failed to process Purchase Order Status Change');
  }
}
}

module.exports = {
  handlePurchaseOrderWebhook,
  handlePurchaseOrderChangeWebhook,
  handlePurchaseOrderStatusChangeWebhook,
};
