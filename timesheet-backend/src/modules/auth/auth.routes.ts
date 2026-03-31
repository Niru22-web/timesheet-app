import { Router } from "express";
import { login, register, forgotPassword, validateResetToken, resetPassword, validateRegistrationToken, completeRegistration } from "./auth.controller";
import { handleMicrosoftCallback } from "../email/email.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/forgot-password", forgotPassword);
router.get("/validate-reset-token", validateResetToken);
router.post("/reset-password", resetPassword);
router.get("/validate-registration-token", validateRegistrationToken);
router.post("/complete-registration", completeRegistration);

// Microsoft OAuth fallback route
router.get("/microsoft/callback", handleMicrosoftCallback);


export default router;