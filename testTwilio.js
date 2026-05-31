import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
    console.error("Missing credentials");
    process.exit(1);
}

const client = twilio(accountSid, authToken);

async function test() {
    const driverDetails = `Name: John Doe | Lic: D12345 | Veh: ABC-1234 | Blood: O+ | Cond: None | Meds: None | Addr: 123 Main St`;
    const alertReason = `High Heart Rate Detected: 135 BPM`;

    try {
        const message = await client.messages.create({
            from: 'whatsapp:+14155238886',
            to: 'whatsapp:+919633757536',
            contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
            contentVariables: JSON.stringify({ "1": driverDetails, "2": alertReason })
        });
        console.log('Success:', message.sid);
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
