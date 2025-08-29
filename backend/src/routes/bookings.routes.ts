import { Router } from 'express';
import { BookingsController } from '../controllers/bookings.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';

const r = Router();

r.get('/', requireAdmin, BookingsController.listAll);

r.get('/resource/:resourceId', requireAuth, BookingsController.listByResource);

r.post('/', requireAuth, BookingsController.create);

r.put('/:id', requireAdmin, BookingsController.update);
r.delete('/:id', requireAdmin, BookingsController.remove);

export default r;