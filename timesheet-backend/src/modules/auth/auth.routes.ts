import { Router } from "express";
import { login, register, forgotPassword, validateResetToken, resetPassword } from "./auth.controller";
import { handleMicrosoftCallback } from "../email/email.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.get("/validate-reset-token", validateResetToken);
router.post("/reset-password", resetPassword);
router.get("/outlook/callback", handleMicrosoftCallback);

export default router;