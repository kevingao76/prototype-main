import config from "../config.js";
import {GridFSBucket, MongoClient} from "mongodb";

const uri = config.mongoDbUrl;
const dbName = config.dbName;


async function connectToDatabase() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected successfully to MongoDB");
        return client;
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        throw error;
    }
}

async function closeDatabaseConnection(client) {
    try {
        await client.close();
        console.log("MongoDB connection closed");
    } catch (error) {
        console.error("Failed to close MongoDB connection", error);
    }
}

async function uploadToGridFS(file, metadata) {
    const client = await connectToDatabase();
    console.log("uploadToGridFS Log ",file);
    try {
        const db = client.db(dbName);
        const bucket = new GridFSBucket(db, { bucketName: "uploads" });

        // Dynamic import of the 'stream' module
        const { Readable } = await import('stream');

        const uploadStream = bucket.openUploadStream(file.originalname, { metadata });
        const bufferStream = Readable.from(file.buffer);
        console.log("before promise");
        const uploadPromise = new Promise((resolve, reject) => {
            bufferStream.pipe(uploadStream)
                .on('error', (err) => {
                    reject(err);
                    closeDatabaseConnection(client); // Close connection on error
                    console.log("buffer failed");
                })
                .on('finish', () => {
                    resolve(uploadStream.id);
                    closeDatabaseConnection(client); // Close connection on finish
                    console.log("buffer successful");
                });
        });

        return uploadPromise;
    } catch (error) {
        closeDatabaseConnection(client); // Ensure connection is closed on catch
        throw error;
    }
}
export {uploadToGridFS}
export {connectToDatabase}
