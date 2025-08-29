import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const r = Router();

// User
r.post('/user/signup', AuthController.userSignup);
r.post('/user/login',  AuthController.userLogin);

// Admin
r.post('/admin/signup', AuthController.adminSignup);
r.post('/admin/login',  AuthController.adminLogin);

export default r;