import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env.local' });

const app = express();
app.use(cors());
app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
    console.error("❌ ERROR: Missing Twilio credentials in your .env.local file");
    process.exit(1);
}

const client = twilio(accountSid, authToken);

// The API Endpoint your Raspberry Pi will call
app.post('/api/trigger-emergency', async (req, res) => {
    console.log("🚨 Received emergency trigger request from Raspberry Pi!");
    
    try {
        const message = await client.messages.create({
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+919633757536',
            contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
            contentVariables: JSON.stringify({ "1": "12/1", "2": "3pm" })
        });
        
        console.log(`✅ WhatsApp Sent Successfully! Message SID: ${message.sid}`);
        res.status(200).json({ success: true, message: "WhatsApp Alert Dispatched", sid: message.sid });
    } catch (error) {
        console.error('❌ Failed to send WhatsApp alert:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(` Driver Guard API Server is running...`);
    console.log(` Local API URL: http://localhost:${PORT}/api/trigger-emergency`);
    console.log(`To expose this API to the internet for your Raspberry Pi, run:`);
    console.log(`npx localtunnel --port ${PORT}`);
});
