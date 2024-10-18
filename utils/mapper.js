const statusMapping = {
  APPROVED: 'issued',
  CANCELED: 'cancelled',
  COMPLETED: 'closed',
  DECLINED: 'error',  // Assuming declined is an error in Coupa
  PARTIALLY_FULFILLED: 'expensed',  // Assuming partially fulfilled is expensed in Coupa
  PENDING: 'draft',  // Pending is similar to draft in Coupa
  REQUESTED: 'buyer_hold',  // Requested could mean on hold by the buyer in Coupa
};

// Function to map MaintainX status to Coupa status
function mapStatus(maintainXStatus) {
  return statusMapping[maintainXStatus] || 'draft'; // Default to 'draft' if no match is found
}

//map MaintainX data to create Order_lines in Coupa
const mapMaintainXToCoupaOrderLines = (maintainXItems) => {
  return maintainXItems.map(item => ({
    manufacturer_part_number: item.partNumber,
    description: item.name,
    quantity: item.quantityOrdered,
    price: { amount: item.unitCost },
    total_amount: item.price,
    external_reference_number: purchaseOrderId
  }));
};

//Map MaintainX data to create address in Coupa
const mapMaintainXToCoupaAddress = (maintainXAddress) => {
  return {
    city: maintainXAddress.city,
    country: maintainXAddress.country,
    postal_code: maintainXAddress.postalCode,
    state: maintainXAddress.state,
    street1: maintainXAddress.street,
    attention: maintainXAddress.label,
  };
};

const mapMaintainXToCoupa = (maintainXPO) => {
  return {
    //po_number: maintainXPO.newPurchaseOrder.overrideNumber || maintainXPO.newPurchaseOrder.autoGeneratedNumber,
    requester: maintainXPO.newPurchaseOrder.creatorId,//if theyy have the same ID across two systems, if not can hard code the ID mapping

    status: mapStatus(maintainXPO.newPurchaseOrder.status),
     
    // Ship-to address
     ship_to_address: {
      id: addressId,
    },
    order_lines: orderLineIds.map(id => ({ id })), 

    supplier: maintainXPO.newPurchaseOrder.vendorId, //Globol supplirer id? 

    currency: maintainXPO.newPurchaseOrder.extraFields.currency,
    version: 1,
  };
};
//map the new changed status
const mapMaintainXToCoupaPOStatus = (maintainXStatus) => {
  return {
    status: maintainXStatus.status,  // Only update the status field
  };
};
module.exports = { mapMaintainXToCoupa };

hide-price
