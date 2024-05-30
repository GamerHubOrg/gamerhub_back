import { Router } from "express";
import { fetchLolApi } from "./fetcher.controller";
import WordModel from "../../models/Word/Word.model";

const router: Router = Router();

router.get("/lol", fetchLolApi);

router.get("/lol-a", async (_req, res) => {
  const allWords = await WordModel.find();
  res.send(allWords);
});

export default router;
