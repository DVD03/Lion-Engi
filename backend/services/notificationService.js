/**
 * Lions Engineering - WhatsApp & SMS Alert Notification Service
 * Dispatches automated rental alerts via Webhook or SMS gateway.
 */

const http = require('http');
const https = require('https');

class NotificationService {
  /**
   * Send WhatsApp / SMS Notification for a Rental event
   * @param {Object} rental - Populated rental document
   * @param {string} eventType - 'Booking Confirmed' | 'Return Reminder' | 'Overdue Alert' | 'Custom'
   * @param {string} customMsg - Optional custom override message
   */
  static async sendAlert(rental, eventType, customMsg = '') {
    const customer = rental.customer;
    const tool = rental.tool;
    const phone = customer ? customer.phone : '';
    const name = customer ? customer.name : 'Valued Contractor';
    const toolName = tool ? `${tool.name} (${tool.serialNumber})` : 'Equipment';
    const dueDateStr = new Date(rental.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    let messageBody = '';

    if (customMsg) {
      messageBody = customMsg;
    } else {
      switch (eventType) {
        case 'Booking Confirmed':
          messageBody = `🦁 *LIONS ENGINEERING RENTAL CONFIRMATION*\n\nDear ${name},\nYour rental agreement *${rental.rentalCode}* for *${toolName}* is confirmed.\n\n📅 *Due Date:* ${dueDateStr}\n🚚 *Delivery Mode:* ${rental.deliveryMode || 'Store Pickup'}\n💰 *Total Amount:* LKR ${rental.totalAmount.toLocaleString()}\n🔒 *Deposit Held:* LKR ${rental.depositAmount.toLocaleString()}\n\nThank you for choosing Lions Engineering! Hotline: +94 11 234 5678`;
          break;

        case 'Return Reminder':
          messageBody = `🦁 *LIONS ENGINEERING RETURN REMINDER*\n\nDear ${name},\nFriendly reminder that equipment *${toolName}* under agreement *${rental.rentalCode}* is scheduled for return tomorrow (${dueDateStr}).\n\nPlease ensure fuel levels and accessories are intact. For lease extension, call +94 11 234 5678.`;
          break;

        case 'Overdue Alert':
          messageBody = `⚠️ *URGENT: OVERDUE RETURN NOTICE - LIONS ENGINEERING*\n\nDear ${name},\nAgreement *${rental.rentalCode}* for *${toolName}* was due on *${dueDateStr}* and is now OVERDUE.\n\nDaily late fees are actively accruing. Please return the equipment immediately to avoid additional penalties. Hotline: +94 11 234 5678`;
          break;

        default:
          messageBody = `🦁 *Lions Engineering Update* for Agreement ${rental.rentalCode}: Status updated to ${rental.status}.`;
      }
    }

    const payload = {
      channel: 'WhatsApp/SMS',
      recipient: phone,
      recipientName: name,
      agreementCode: rental.rentalCode,
      eventType,
      message: messageBody,
      timestamp: new Date().toISOString(),
    };

    console.log(`\n======================================================`);
    console.log(`📲 [WHATSAPP/SMS DISPATCHER] Message Triggered:`);
    console.log(`Recipient: ${name} (${phone})`);
    console.log(`Event: ${eventType}`);
    console.log(`Content:\n${messageBody}`);
    console.log(`======================================================\n`);

    // If a webhook URL is configured in environment, dispatch HTTP POST
    const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        const urlObj = new URL(webhookUrl);
        const protocol = urlObj.protocol === 'https:' ? https : http;
        const postData = JSON.stringify(payload);

        const req = protocol.request(
          webhookUrl,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(postData),
            },
          },
          (res) => {
            console.log(`Webhook responded with status: ${res.statusCode}`);
          }
        );

        req.on('error', (e) => {
          console.error(`Webhook dispatch error: ${e.message}`);
        });

        req.write(postData);
        req.end();
      } catch (err) {
        console.error('Failed to trigger notification webhook:', err.message);
      }
    }

    return {
      success: true,
      channel: 'WhatsApp/SMS',
      recipient: phone,
      type: eventType,
      message: messageBody,
      sentAt: new Date(),
      status: 'Delivered',
    };
  }
}

module.exports = NotificationService;
