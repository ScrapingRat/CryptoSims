import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

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

const addConnectionHandlers = () => {
	mongoose.connection.on('connected', () => {
		console.log('MongoDB connected successfully');
	});

	mongoose.connection.on('error', (error) => {
		console.error('MongoDB connection error:', error);
	});

	mongoose.connection.on('disconnected', () => {
		console.log('MongoDB connection lost');
	});
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
	}
};

const mongoDbService: MongoDbService = {
	connect,
	disconnect
};

export default mongoDbService;
