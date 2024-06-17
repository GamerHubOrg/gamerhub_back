import { Router } from 'express';
import { getKeycloakUser } from '../../services/keycloak';
import * as userService from '../users/users.service';

const router: Router = Router();

router.post('/keycloak', async (req, res) => {
    try {
        const data = req.body;

        if (!data) {
            res.json({ success: true })
            return;
        }

        const user = await getKeycloakUser(data.userId)

        const dataToSync = {
            keycloakId: user.id,
            userName: user.username,
            email: user.email
        }

        // TODO: Sync user in database or create him
        const existingUser = await userService.findById(user.id);

        if (!existingUser) {
            await userService.createUser({
                ...dataToSync,
                roles: 'user',
                xp: 0,
            })
            res.json({ success: true })
            return;
        }

        await userService.updateUser(user.id, dataToSync)

        res.json({ success: true })
    } catch(err: any) {
        res.status(400).json(err);
    }
});

export default router;