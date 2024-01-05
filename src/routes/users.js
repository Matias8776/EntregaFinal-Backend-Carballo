import { Router } from 'express';
import { addDocuments, changeRole, deleteUser, uploaderDocuments } from '../controllers/users.js';

const router = Router();

router.get('/premium/:uid', changeRole);

router.delete('/:uid', deleteUser);

router.post('/:uid/documents', uploaderDocuments, addDocuments);

export default router;
