import express from "express";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import { createAnnouncement, deleteAnnouncement, getAnnouncements } from "../controllers/announcementController.js";


const announcementRouter = express.Router();

announcementRouter.post("/", verifyToken, isAdmin, createAnnouncement);
announcementRouter.get("/",verifyToken, getAnnouncements);

announcementRouter.delete("/:id", verifyToken, isAdmin, deleteAnnouncement);


export default announcementRouter;