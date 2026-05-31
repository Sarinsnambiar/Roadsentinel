import twilio from 'twilio';
import dotenv from 'dotenv';

// Load variables from .env.local
dotenv.config({ path: './.env.local' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
    console.error("ERROR: Missing Twilio credentials in .env.local file");
    process.exit(1);
}

const client = twilio(accountSid, authToken);

async function sendWhatsAppAlert() {
    console.log(`Attempting to send WhatsApp message to +919633757536...`);
    
    try {
        const message = await client.messages.create({
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+919633757536',
            contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
            contentVariables: JSON.stringify({ "1": "12/1", "2": "3pm" })
        });
        
        console.log('✅ WhatsApp Message Sent Successfully!');
        console.log(`Message SID: ${message.sid}`);
    } catch (error) {
        console.error('❌ Failed to send WhatsApp:');
        console.error(error.message);
    }
}

// Execute test
sendWhatsAppAlert();
