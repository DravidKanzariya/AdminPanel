import { Router } from "express";
import {forgotPassword, resetPassword} from "../controllers/mail.controller.js"

const router = Router();

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
