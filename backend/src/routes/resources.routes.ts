import { Router } from 'express';
import { ResourcesController } from '../controllers/resources.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const r = Router();

r.get('/', requireAuth, ResourcesController.list);
r.get('/:id', requireAuth, ResourcesController.get);
r.get('/:id/ping', requireAuth, ResourcesController.ping);

r.post('/', requireAuth, requireAdmin, ResourcesController.create);
r.put('/:id', requireAuth, requireAdmin, ResourcesController.update);
r.delete('/:id', requireAuth, requireAdmin, ResourcesController.remove);

export default r;