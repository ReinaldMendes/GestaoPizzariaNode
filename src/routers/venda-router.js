import { Router } from "express";
import {
  index,
  show,
  store,
  destroy,
} from "../controllers/venda-controller.js";
import jwtAuthenticator from "../middlewares/jwt-autenticator.js";
import authorizer from "../middlewares/authorizer.js";

const router = Router();

router.use(jwtAuthenticator);
router.use(authorizer("ADMINISTRATOR"));

router.get("/", index); // Listar todas as vendas
router.get("/:id", show); // Buscar uma venda por ID
router.post("/", store); // Criar venda
router.delete("/:id", destroy); // Deletar venda por ID (restaura o estoque)

export default router;
