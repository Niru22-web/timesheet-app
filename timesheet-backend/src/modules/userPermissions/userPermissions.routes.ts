import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import {
  getAllUsers,
  getUserPermissions,
  saveUserPermissions,
  getCurrentUserPermissions
} from "./userPermissions.controller";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all users (admin only)
router.get("/users", authorize(["admin"]), getAllUsers);

// Get permissions for a specific user (admin only)
router.get("/user-permissions/:userId", authorize(["admin"]), getUserPermissions);

// Save permissions for a user (admin only)
router.post("/user-permissions", authorize(["admin"]), saveUserPermissions);

// Get current user's permissions (for route guards)
router.get("/my-permissions", getCurrentUserPermissions);

export default router;
