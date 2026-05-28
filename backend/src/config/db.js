const dns = require('dns');
const mongoose = require('mongoose');

const DEFAULT_MONGODB_DNS_SERVERS = ['1.1.1.1', '8.8.8.8'];

const configureMongoDns = (uri) => {
  if (!uri.startsWith('mongodb+srv://')) {
    return;
  }

  const configuredServers = (process.env.MONGODB_DNS_SERVERS || '')
    .split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  const servers = configuredServers.length > 0
    ? configuredServers
    : DEFAULT_MONGODB_DNS_SERVERS;

  dns.setServers(servers);
  console.log(`MongoDB DNS servers: ${servers.join(', ')}`);
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('MongoDB Connection Error: MONGODB_URI is missing in .env');
    process.exit(1);
  }

  try {
    configureMongoDns(mongoUri);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);

    if (error.code === 'ECONNREFUSED' && /querySrv/i.test(error.message)) {
      console.error(
        'DNS SRV lookup was refused. Try setting MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8 or use a non-SRV MongoDB connection string.'
      );
    }

    process.exit(1);
  }
};

module.exports = connectDB;
