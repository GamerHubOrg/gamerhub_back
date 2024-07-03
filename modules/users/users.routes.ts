import { Router } from 'express';
import { PostLogin, PostRegister, PostLogout, GetMe, GetUser, GetRefreshAccessToken, UpdateUserById, UpdateUserPassword, DeleteUser} from './users.controller';
import authenticated from '../../middlewares/authenticated'
import cache from '../../middlewares/cache'

const router: Router = Router();

router.post('/login', PostLogin);
router.post('/register', PostRegister);
router.get('/refresh', GetRefreshAccessToken);
router.post('/logout', authenticated, PostLogout);
router.get('/me', authenticated, GetMe);
router.get('/:userId', cache, authenticated, GetUser);
router.put('/:userId', authenticated, UpdateUserById);
router.put('/password/:userId', authenticated, UpdateUserPassword);
router.post('/delete/:userId', authenticated, DeleteUser);

export default router;