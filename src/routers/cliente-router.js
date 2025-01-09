import { Router } from "express";
import {
  index,
  show,
  store,
  update,
  destroy,
} from "../controllers/cliente-controller.js";
import jwtAuthenticator from "../middlewares/jwt-autenticator.js";
import authorizer from "../middlewares/authorizer.js";

const router = Router();

router.use(jwtAuthenticator);
router.use(authorizer("ADMINISTRATOR"));

router.get("/", index); // Listar todos os clientes
router.get("/:id", show); // Buscar um cliente por ID
router.post("/", store); // Criar um novo cliente
router.put("/:id", update); // Atualizar um cliente por ID
router.delete("/:id", destroy); // Deletar um cliente por ID

export default router;
