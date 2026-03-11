import { Router } from "express";
import { createEmployee, deleteEmployee, getEmployees, getEmployeesByDepartment } from "./employee.controller";
import { completeEmployeeProfile, getEmployeeByEmail, uploadProfileDocuments, updateProfilePhoto, uploadProfilePhoto } from "./employeeProfile.controller";

const router = Router();

// Employee management routes
router.post("/", createEmployee);
router.get("/", getEmployees);
router.get("/department", getEmployeesByDepartment);
router.get("/by-email", getEmployeeByEmail);
router.delete("/:id", deleteEmployee);

// Employee profile completion routes
router.post("/complete-profile", uploadProfileDocuments, completeEmployeeProfile);

// Profile photo upload route
router.put("/profile-photo", uploadProfilePhoto, updateProfilePhoto);

export default router;