import mongoose from 'mongoose';
import getConfig from './getConfig';

mongoose.connection.setMaxListeners(10);

const { MONGODB_URI } = getConfig();

const options = {
	dbName: 'cryptosims',
	bufferCommands: true,
	autoIndex: true,
	maxPoolSize: 10,
	serverSelectionTimeoutMS: 5000,
	socketTimeoutMS: 45000
};

interface CachedMongoose {
	conn: typeof mongoose | null;
	promise: Promise<typeof mongoose> | null;
}

interface MongoDbService {
	connect: () => Promise<typeof mongoose>;
	disconnect: () => Promise<void>;
}

const cached: { mongoose: CachedMongoose } = {
	mongoose: {
		conn: null,
		promise: null
	}
};

let listenersAdded = false;

const handleConnected = () => console.log('MongoDB connected successfully');
const handleError = (error: Error) =>
	console.error('MongoDB connection error:', error);
const handleDisconnected = () => console.log('MongoDB connection lost');

const addConnectionHandlers = () => {
	if (listenersAdded) return;

	mongoose.connection.on('connected', handleConnected);
	mongoose.connection.on('error', handleError);
	mongoose.connection.on('disconnected', handleDisconnected);

	listenersAdded = true;
};

const removeConnectionHandlers = () => {
	mongoose.connection.off('connected', handleConnected);
	mongoose.connection.off('error', handleError);
	mongoose.connection.off('disconnected', handleDisconnected);

	listenersAdded = false;
};

const validateConfig = () => {
	if (!MONGODB_URI) {
		throw new Error('MongoDB URI is not set');
	}
};

export const connect = async () => {
	if (cached.mongoose.conn) {
		return cached.mongoose.conn;
	}

	validateConfig();

	if (!cached.mongoose.promise) {
		addConnectionHandlers();

		cached.mongoose.promise = mongoose
			.connect(MONGODB_URI, options)
			.then((mongoose) => {
				return mongoose;
			});
	}

	try {
		cached.mongoose.conn = await cached.mongoose.promise;
		return cached.mongoose.conn;
	} catch (error) {
		cached.mongoose.promise = null;
		throw new Error(`Database connection failed: ${error}`);
	}
};

export const disconnect = async () => {
	if (cached.mongoose.conn) {
		await mongoose.disconnect();
		cached.mongoose.conn = null;
		cached.mongoose.promise = null;
		removeConnectionHandlers();
	}
};

process.on('SIGINT', async () => {
	await disconnect();
	process.exit(0);
});

process.on('SIGTERM', async () => {
	await disconnect();
	process.exit(0);
});

const mongoDbService: MongoDbService = {
	connect,
	disconnect
};

export default mongoDbService;
