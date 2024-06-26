import { Router } from "express";
import { fetchLolApi } from "./lol/lol-fetcher.controller";
import { fetchPokemonApi } from "./pokemon/pokemon-fetcher.controller";

const router: Router = Router();

router.get("/lol", fetchLolApi);

router.get("/pokemon", fetchPokemonApi);

export default router;
