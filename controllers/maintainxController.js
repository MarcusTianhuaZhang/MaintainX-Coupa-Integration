const {
  createCoupaAddress,
  createCoupaOrderLines,
  createCoupaPurchaseOrder,
  updateCoupaPurchaseOrderChange,
  createCoupaPurchaseOrderChange,
  uploadPOAttachments,
  checkPOVersion
} = require('../services/coupaService');

const {
  mapMaintainXToCoupaOrderLines,
  mapMaintainXToCoupaPO,
  mapMaintainXToCoupaPOChange,
  mapMaintainXToCoupaAddress
} = require('../utils/mapper');

const { validateWebhookSignature } = require('../utils/validator'); 


async function handlePurchaseOrderWebhook(req, res) {
  
  const isValid = validateWebhookSignature(req.headers, req.body, `${req.protocol}://${req.get('host')}${req.originalUrl}`, 'create');
  if (!isValid) return res.status(400).send('Invalid webhook signature');

  const maintainXData = req.body;

  try {
    // Step 1: Create the address and get its ID. set Adress to null if there isn't address passed in
    let addressId = null;
    if (newPurchaseOrder.shippingAddress) {
      const coupaAddressData = mapMaintainXToCoupaAddress(newPurchaseOrder.shippingAddress);
      addressId = await createCoupaAddress(coupaAddressData);
    }

    // Step 2: Map and create address and Coupa order lines
       // Step 2: Handle order lines (required)
    if (!newPurchaseOrder.items || newPurchaseOrder.items.length === 0) {
      throw new Error('Order lines are required but missing in the Purchase Order data.');
    }
    
    const coupaOrderLinesData = mapMaintainXToCoupaOrderLines(maintainXData.newPurchaseOrder.items);
    const createdOrderLines = await createCoupaOrderLines(coupaOrderLinesData);  // Create the order lines and get their IDs
    const orderLineIds = createdOrderLines.map(line => line.id);

    // Step 3: Map and create the Purchase Order in Coupa with the created order line IDs and address ID
    const coupaPOData = mapMaintainXToCoupaPO(maintainXData, orderLineIds, addressId);
    const poId = await createCoupaPurchaseOrder(coupaPOData, orderLineIds, addressId);

    // Step 4: Handle attachments if any
    const attachments = maintainXData.newPurchaseOrder.attachments || [];
    await uploadPOAttachments(attachments, poId);

    res.status(200).send('Purchase Order and attachments synced successfully');

  } catch (error) {
    console.error('Error syncing Purchase Order:', error);
    res.status(500).send('Failed to sync Purchase Order');
  }


// Handle Purchase Order Change Webhook
async function handlePurchaseOrderChangeWebhook(req, res) {
  
  const isValid = validateWebhookSignature(req.headers, req.body, `${req.protocol}://${req.get('host')}${req.originalUrl}`, 'change');
  if (!isValid) return res.status(400).send('Invalid webhook signature');

  const maintainXData = req.body;
  const orderHeaderId = maintainXData.purchaseOrderId; //need to make sure the COupa PO id and MaintainX PO ID are consistant 

  try {
    // Step 1: Fetch PO in Coupa and Check PO version using the PO GET API
    const originalPO = await getOriginalPOFromCoupa(orderHeaderId);
    const poVersion = await checkPOVersion(orderHeaderId);

    if (!poVersion) {
      return res.status(400).send('No valid PO version found.');
    }

    // Step 2: Map the PO change data from MaintainX to Coupa
    const changeData = await mapMaintainXToCoupaPOChange(maintainXData, originalPO);

    if (poVersion > 1) {
      // If the PO has been revised (version > 1), use PUT to update the existing change
      await updateCoupaPurchaseOrderChange(orderHeaderId, changeData);
      res.status(200).send('Purchase Order Change updated successfully.');
    } else {
      // If this is a new change (version = 1), use POST to create a new PO change
      const newChangeId = await createCoupaPurchaseOrderChange(changeData);
      res.status(200).send(`Purchase Order Change created successfully, ID: ${newChangeId}`);
    }
  } catch (error) {
    console.error('Error processing Purchase Order Change:', error);
    res.status(500).send('Failed to process Purchase Order Change');
  }
}

}

module.exports = {
  handlePurchaseOrderWebhook,
  handlePurchaseOrderChangeWebhook
};