import { Router } from 'express';
import {getSubServiceById} from "../controller/subServiceController.js";


const router = Router();

router.get('/:id', getSubServiceById);

export default router;
