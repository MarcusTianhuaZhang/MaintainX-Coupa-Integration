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

// Function to handle attachment uploads to Coupa PO
async function uploadPOAttachments(attachments, poId) {

  if (!attachments || attachments.length === 0) {
    console.log('No attachments to upload.');
    return; // Exit the function early if there are no attachments
  }

  const token = await getCoupaAccessToken();
  for (const attachment of attachments) {
    try {
      const response = await uploadAttachmentToCoupa(attachment, poId, config.coupa.poUrl, token);
      console.log(`Attachment ${attachment.fileName} uploaded successfully.`);
      
      return response.id;  // Return PO ID for further use (e.g., attachments)
    } catch (error) {
      console.error(`Error uploading attachment ${attachment.fileName}:`, error);
    }
    return null;
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


// Function to check the PO version using Coupa PO GET API
async function checkPOVersion(orderHeaderId) {
  const token = await getCoupaAccessToken();

  try {
    // Use the PO GET API with exported=false to check the version(per Coupa API document)
    const response = await axios.get(`${config.coupa.poUrl}/${orderHeaderId}?exported=false`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const poData = response.data;
    
    if (poData && poData.version) {
      return poData.version;  // Return the version of the PO
    }

    return null;  // No version found or PO does not exist
  } catch (error) {
    console.error('Error checking PO version in Coupa:', error);
    throw new Error('Failed to check PO version.');
  }
}

// Function to update a Purchase Order Change in Coupa
async function updateCoupaPurchaseOrderChange(changeId, updateData) {
  const token = await getCoupaAccessToken();

  try {
    const response = await axios.put(`${config.coupa.poChangeUrl}/${changeId}`, updateData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log(`Purchase Order Change ${changeId} updated in Coupa successfully.`);
   
    return response.data;  // Return response data if needed
  
  } catch (error) {
    console.error(`Error updating Purchase Order Change ${changeId} in Coupa:`, error);
    throw new Error('Coupa API update request failed.');
  }
}

async function createCoupaPurchaseOrderChange(poChangeData) {
  const token = await getCoupaAccessToken();
  
  // Ensure that 'order-header-id' is present in the payload
  if (!poChangeData['order-header-id']) {
    throw new Error('Missing order-header-id in the Purchase Order Change data');
  }
  
  try {
    const response = await axios.post(config.coupa.poChangeUrl, poChangeData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.id;  // Return the new PO change ID
  } catch (error) {
    console.error('Error creating Purchase Order Change in Coupa:', error);
    throw new Error('Coupa Purchase Order Change creation request failed.');
  }
}


module.exports = {
  createCoupaAddress,
  createCoupaOrderLines,
  createCoupaPurchaseOrderChange,
  updateCoupaPurchaseOrderChange,
  uploadPOAttachments,
  checkPOVersion,
  createCoupaPurchaseOrder
};
