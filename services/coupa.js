const { getCoupaAccessToken } = require('../utils/auth');
const { uploadAttachmentToCoupa } = require('../utils/fileUpload');
const config = require('../config/config');
const axios = require('axios');

// Function to create an address in Coupa
async function createCoupaAddress(addressData) {
  const token = await getCoupaAccessToken();

  try {
    const response = await axios.post(config.coupa.addressUrl, addressData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.id;  // Return the address ID
  } catch (error) {
    console.error('Error creating address in Coupa:', error);
    throw new Error('Coupa address creation request failed.');
  }
}

// Function to create order lines in Coupa
async function createCoupaOrderLines(orderLinesData) {
  const token = await getCoupaAccessToken();

  try {
    const response = await axios.post(config.coupa.orderLinesUrl, orderLinesData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;  // Return the order lines data (including IDs)
  } catch (error) {
    console.error('Error creating order lines in Coupa:', error);
    throw new Error('Coupa order lines creation request failed.');
  }
}

// Function to create a Purchase Order in Coupa, with order lines and address associated
async function createCoupaPurchaseOrder(poData, orderLineIds, addressId) {
  const token = await getCoupaAccessToken();

  // Add the created order line IDs and address ID to the Purchase Order data
  poData.order_lines = orderLineIds.map(id => ({ id }));
  poData.ship_to_address = { id: addressId };  // Use the created address ID

  try {
    const response = await axios.post(config.coupa.poUrl, poData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.id;  // Return PO ID for further use (e.g., attachments)
  } catch (error) {
    console.error('Error creating Purchase Order in Coupa:', error);
    throw new Error('Coupa Purchase Order creation request failed.');
  }
}

async function updateCoupaPurchaseOrder(orderId, updateData) {
  const token = await getCoupaAccessToken();

  try {
    await axios.patch(`${config.coupa.poUrl}/${orderId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`Purchase Order ${orderId} updated in Coupa successfully.`);
  } catch (error) {
    console.error(`Error updating Purchase Order ${orderId} in Coupa:`, error);
    throw new Error('Coupa API update request failed.');
  }
}

// Function to handle attachment uploads to Coupa PO
async function uploadPOAttachments(attachments, poId) {
  if (attachments && attachments.length > 0) {
    const token = await getCoupaAccessToken();
    for (const attachment of attachments) {
      try {
        await uploadAttachmentToCoupa(attachment, poId, config.coupa.poUrl, token);
        console.log(`Attachment ${attachment.fileName} uploaded successfully.`);
      } catch (error) {
        console.error(`Error uploading attachment ${attachment.fileName}:`, error);
      }
    }
  } else {
    console.log('No attachments to upload.');
  }
}

module.exports = {
  createCoupaAddress,
  createCoupaOrderLines,
  createCoupaPurchaseOrder,
  updateCoupaPurchaseOrder,
  uploadPOAttachments,
};
