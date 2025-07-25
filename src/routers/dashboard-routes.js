// src/routes/dashboard-routes.js
import { Router } from 'express';
import { pizzasVendidas /*, outras funções*/ } from '../controllers/dashboard-controller.js';
import jwtAuthenticator from '../middlewares/jwt-autenticator.js';
import authorizer from '../middlewares/authorizer.js';

const router = Router();

router.use(jwtAuthenticator);
router.use(authorizer('ADMINISTRATOR'));

router.get('/pizzas-vendidas', pizzasVendidas);

// Defina outras rotas como /vendas-mensais, /custos, /lucro aqui

export default router;
