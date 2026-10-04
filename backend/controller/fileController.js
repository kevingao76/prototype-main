import {GridFSBucket, ObjectId} from "mongodb";
import config from "../config.js";
import {uploadToGridFS} from "../utils/fileManagementMiddleware.js";
import {connectToDatabase} from "../utils/fileManagementMiddleware.js";

const dbName = config.dbName;
const collectionName = config.collectionName

export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            throw new Error('No file uploaded'); // Handle missing file
        }
        const fileId = await uploadToGridFS(req.file, req.body); // Access additional data from req.body
        res.json({ message: 'File uploaded successfully!', fileId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error uploading file' });
    }
};

export const getFile = async (req, res) => {
    const client = await connectToDatabase();
    try {
        const db = client.db(dbName);
        console.log("db name ", db);
        const filesCollection = db.collection(`${collectionName}.files`);
        console.log("collection  ", filesCollection);

        const files = await filesCollection.find().toArray();
        console.log("files  ", files);

        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching files' });
    } finally {
        client.close();
    }
};

export const getFileById = async (req, res) => {
    const client = await connectToDatabase();
    try {
        const db = client.db(dbName);
        const bucket = new GridFSBucket(db, { bucketName: collectionName });
        const id = new ObjectId(req.params.id);

        const downloadStream = bucket.openDownloadStream(id);

        downloadStream.on('error', (err) => {
            console.error(err);
            res.status(404).json({ message: 'File not found' });
            client.close();
        });

        downloadStream.on('file', (file) => {
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
        });

        downloadStream.on('end', () => {
            client.close();
        });

        downloadStream.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching file' });
        client.close();
    }
};
