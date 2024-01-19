import { Router } from 'express';
import GetAllGames from './useCases/GetAllGames';

const router: Router = Router();

router.get('/', GetAllGames);

export default router;