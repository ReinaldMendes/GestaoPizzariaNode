// src/routes/promocao-routes.js
import { Router } from 'express';
import {
  index,
  store,
  relatorioPromocao,
} from '../controllers/promocao-controller.js';

const router = Router();

// Rota para criar uma nova promoção
router.post('/promocoes', store);

// Rota para listar todas as promoções
router.get('/promocoes', index);

// Rota para obter o relatório de uma promoção específica
router.get('/promocoes/relatorio/:id', relatorioPromocao);

export default router;