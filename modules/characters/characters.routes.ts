import { Router } from 'express';
import authenticated from '../../middlewares/authenticated'
import isAdmin from '../../middlewares/isAdmin'
import charactersController from './characters.controller';
import cache from '../../middlewares/cache'

const {getAllCharacters, getCharacterById, insertCharacter, updateCharacter, deleteCharacter, deleteCharacters} = charactersController;

const router: Router = Router();

router.get('/', cache, authenticated, isAdmin, getAllCharacters);

router.get('/:id', cache, authenticated, isAdmin, getCharacterById);

router.post('/', authenticated, isAdmin, insertCharacter);

router.put('/:id', authenticated, isAdmin, updateCharacter);

router.post('/delete', authenticated, isAdmin, deleteCharacters);

router.delete('/:id', authenticated, isAdmin, deleteCharacter);

export default router;