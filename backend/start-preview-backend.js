const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const path = require('path');

async function run() {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log(`Memory MongoDB started at ${uri}`);

  const env = {
    ...process.env,
    MONGO_URI: uri,
    PORT: 3000,
    JWT_SECRET: 'preview-secret',
    NODE_ENV: 'development'
  };

  const backend = spawn(process.execPath, ['server.js'], {
    cwd: __dirname,
    env: env,
    stdio: 'inherit'
  });

  backend.on('exit', (code) => {
    console.log(`Backend exited with code ${code}`);
    mongoServer.stop();
  });
}

run().catch(console.error);
