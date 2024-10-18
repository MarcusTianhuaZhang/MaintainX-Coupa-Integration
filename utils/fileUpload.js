//handles purchase order attchments sync
const axios = require('axios');

async function uploadAttachmentToCoupa(attachment, poId, apiUrl, token) {
  const attachmentData = {
    attachment: {
      file_url: attachment.url,
      fileName: attachment.fileName,
      intent: 'Supplier',
      type: attachment.mimeType,
    },
  };

  const response = await axios.post(
    `${apiUrl}/api/purchase_orders/${poId}/attachments`,
    attachmentData,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // Use Bearer token instead of API key
        Accept: 'application/xml',
      },
    }
  );

  return response.data;
}

module.exports = { uploadAttachmentToCoupa };
