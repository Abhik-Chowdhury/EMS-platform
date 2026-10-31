import express from 'express';
import multer from 'multer';
import { createEmployee, deleteEmployee, getAllEmployee, getEmployee, updateEmployee } from '../controllers/employeeController.js';
import { isAdmin, verifyToken } from '../middlewares/authMiddleware.js';


const employeeRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });


employeeRouter.post('/', verifyToken, isAdmin, upload.single("profileImage"), createEmployee);
employeeRouter.get('/', verifyToken, isAdmin, getAllEmployee);
employeeRouter.get("/:id", verifyToken, isAdmin, getEmployee);

employeeRouter.put("/:id", verifyToken, isAdmin, upload.single("profileImage"), updateEmployee);
employeeRouter.delete("/:id", verifyToken, isAdmin, deleteEmployee);

export default employeeRouter;