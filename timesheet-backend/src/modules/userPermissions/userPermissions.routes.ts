import { Router } from "express";
import { authenticate } from "../../middleware/auth.middleware";
import { authorize } from "../../middleware/role.middleware";
import {
  getAllUsers,
  getUserPermissions,
  saveUserPermissions,
  getCurrentUserPermissions,
  getRolePermissions,
  saveRolePermissions
} from "./userPermissions.controller";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get all users (admin only)
router.get("/users", authorize(["admin", "manager", "partner", "owner"]), getAllUsers);

// Get permissions for a specific user (admin only)
router.get("/user-permissions/:userId", authorize(["admin", "manager", "partner", "owner"]), getUserPermissions);

// Save permissions for a user (admin only)
router.post("/user-permissions", authorize(["admin", "manager", "partner", "owner"]), saveUserPermissions);

// Get role-based permissions (admin only)
router.get("/role-permissions/:role", authorize(["admin", "manager", "partner", "owner"]), getRolePermissions);

// Save role-based permissions (admin only)
router.post("/role-permissions", authorize(["admin", "manager", "partner", "owner"]), saveRolePermissions);

// Get current user's permissions (for route guards)
router.get("/my-permissions", getCurrentUserPermissions);

export default router;
