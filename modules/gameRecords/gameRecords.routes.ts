import { Router } from "express";
import authenticated from "../../middlewares/authenticated";
import isAdmin from "../../middlewares/isAdmin";
import gameRecordsController from "./gameRecords.controller";

const {
  getAllGameRecords,
  getGameRecordById,
  insertGameRecord,
  updateGameRecord,
  deleteGameRecord,
  deleteGameRecords,
  getAllGameRecordsByUser
} = gameRecordsController;

const router: Router = Router();

router.get("/", getAllGameRecords);

router.get("/user/:userId", getAllGameRecordsByUser);

router.get("/:id", authenticated, isAdmin, getGameRecordById);

router.post("/", authenticated, isAdmin, insertGameRecord);

router.put("/:id", authenticated, isAdmin, updateGameRecord);

router.post("/delete", authenticated, isAdmin, deleteGameRecords);

router.delete("/:id", authenticated, isAdmin, deleteGameRecord);

export default router