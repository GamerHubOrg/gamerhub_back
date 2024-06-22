import { Router } from "express";
import { fetchLolApi } from "./fetcher.controller";
import { getLolRegions } from "./lol/fetcher.functions";

const router: Router = Router();

router.get("/lol", fetchLolApi);

router.get("/lol-regions", async (req, res) => {
  const regions = await getLolRegions();
  res.send(regions)
});

export default router;
