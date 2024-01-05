import { Router } from 'express';
import {
  cart,
  chat,
  login,
  notFound,
  privateAccess,
  product,
  products,
  publicAccess,
  realtimeproducts,
  register,
  resetPassword,
  sendResetEmail,
  verifyToken
} from '../controllers/views.js';
import { passportCall } from '../utils.js';

const router = Router();

const passportUser = passportCall('user');
const passportAdmin = passportCall('admin');

router.get('/', publicAccess, login);

router.get('/register', publicAccess, register);

router.get('/realtimeproducts', passportAdmin, realtimeproducts);

router.get('/chat', privateAccess, passportUser, chat);

router.get('/products', privateAccess, products);

router.get('/products/:pid', privateAccess, product);

router.get('/carts/:cid', privateAccess, cart);

router.get('/sendresetemail', publicAccess, sendResetEmail);

router.get('/resetpassword/:email', publicAccess, verifyToken, resetPassword);

router.use(notFound);

export default router;
