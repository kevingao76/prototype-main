import {Router} from "express";
import {sendNotification, getNotifications} from "../controller/notificationController.js";

const router = Router();

router.post('/send', sendNotification);

router.get('/get/:id', getNotifications);

export default router;