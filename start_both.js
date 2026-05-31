import { spawn } from 'child_process';

console.log('🚀 Starting the React App and Express API Server...');

// Start servers
const reactApp = spawn('npm', ['run', 'dev'], { shell: true });
const apiServer = spawn('node', ['server.js'], { shell: true });

console.log('🌍 Requesting Public Internet URLs from LocalTunnel for both servers...');

// Request Tunnels with custom subdomains (these will be your "semi-permanent" URLs)
const reactTunnel = spawn('npx', ['localtunnel', '--port', '5173', '--subdomain', 'driverguard-react-app-sarin'], { shell: true });
const apiTunnel = spawn('npx', ['localtunnel', '--port', '3000', '--subdomain', 'driverguard-api-sarin'], { shell: true });

reactTunnel.stdout.on('data', data => {
    let output = data.toString().trim();
    output = output.replace('your url is: ', ''); // Clean up the URL string
    if (output && output.startsWith('https')) console.log(`\n=================================\n📱 REACT APP URL (Test the Frontend!): \n=> ${output}\n=================================\n`);
});

apiTunnel.stdout.on('data', data => {
    let output = data.toString().trim();
    output = output.replace('your url is: ', ''); // Clean up the URL string
    if (output && output.startsWith('https')) console.log(`\n=================================\n🚨 API SERVER URL (For Raspberry Pi!): \n=> ${output}/api/trigger-emergency\n=================================\n`);
});

reactTunnel.stderr.on('data', data => console.error(`React Tunnel Error: ${data}`));
apiTunnel.stderr.on('data', data => console.error(`API Tunnel Error: ${data}`));
