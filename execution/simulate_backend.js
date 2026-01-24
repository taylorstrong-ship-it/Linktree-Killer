import dotenv from 'dotenv';
import handler from '../api/generate.js';

dotenv.config();

// Fix for fetch in Node (if needed, but Node 18+ has fetch)
// import fetch from 'node-fetch'; 
// global.fetch = fetch;

const mockReq = {
    method: 'POST',
    body: {
        url: 'https://tayloredpetportraits.com'
    }
};

const mockRes = {
    statusCode: 200,
    headers: {},
    setHeader: (key, value) => {
        mockRes.headers[key] = value;
    },
    status: (code) => {
        mockRes.statusCode = code;
        return mockRes;
    },
    json: (data) => {
        console.log('✅ Response Received:');
        console.log(JSON.stringify(data, null, 2));
        return mockRes;
    }
};

console.log('🚀 Starting Backend Simulation...');
handler(mockReq, mockRes).then(() => {
    console.log('🏁 Simulation Complete');
}).catch(err => {
    console.error('❌ Simulation Failed:', err);
});
