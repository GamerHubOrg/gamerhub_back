import { Router } from 'express';
import { GetUser } from './users.controller';

const router: Router = Router();

router.get('/:userId', GetUser);

export default router;