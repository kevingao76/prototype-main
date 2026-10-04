import { Router } from 'express';
import {getFile, getFileById, uploadFile} from "../controller/fileController.js";
import multer from "multer";

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({storage});

router.post('/upload', upload.single('file'), uploadFile);

router.get('/get', getFile);

router.get('/get/:id', getFileById);

export default router;