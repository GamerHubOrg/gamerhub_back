import { Router } from "express";
import { fetchLolApi } from "./fetcher.controller";
import CharacterModel from "../../models/Character/Character.model";

const router: Router = Router();

router.get("/lol", fetchLolApi);

router.get("/lol-a", async (_req, res) => {
  const allCharacters = await CharacterModel.find();
  res.send(allCharacters);
});

export default router;
