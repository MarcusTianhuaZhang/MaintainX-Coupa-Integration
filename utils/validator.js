const crypto = require('crypto');
const config = require('../config/config');

// Validate the MaintainX webhook signature
function validateWebhookSignature(headers, body, fullUri) {
  // Validate the body signature
  const bodySignature = headers['x-maintainx-webhook-body-signature'];
  const isValidBodySignature = validateSignature(bodySignature, body, config.maintainx.webhookSecret);

  // Validate the URI signature
  const uriSignature = headers['x-maintainx-webhook-uri-signature'];
  const isValidUriSignature = validateSignature(uriSignature, fullUri, config.maintainx.webhookSecret);

  // Both signatures must be valid
  return isValidBodySignature && isValidUriSignature;
}

// Helper function to validate signature for both body and URI
function validateSignature(signatureHeader, data, secret) {
  if (!signatureHeader) {
    return false; // Signature header is missing
  }

  // Split the header into timestamp and signature parts
  const [timestampPart, signaturePart] = signatureHeader.split(',');
  const timestamp = timestampPart.split('=')[1];
  const receivedSignature = signaturePart.split('=')[1];

  // Prepare the signed payload string as <timestamp>.<data>
  const signedPayload = `${timestamp}.${typeof data === 'object' ? JSON.stringify(data) : data}`;

  // Calculate the expected signature using HMAC SHA256
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  // Compare the received signature to the expected signature
  return receivedSignature === expectedSignature;
}

module.exports = { validateWebhookSignature };
