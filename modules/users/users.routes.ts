import { Router } from 'express';
import { PostLogin, PostRegister, PostLogout, GetMe, GetUser } from './users.controller';
import authenticated from '../../middlewares/authenticated'

const router: Router = Router();

router.post('/login', PostLogin);
router.post('/register', PostRegister);
router.post('/logout', authenticated, PostLogout);
router.get('/me', authenticated, GetMe);
router.get('/:userId', authenticated, GetUser);

export default router;