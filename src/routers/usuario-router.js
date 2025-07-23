import { Router } from "express";
import {
  signup,
  login,
  store,
  index,
  show,
  update,
  destroy,
} from "../controllers/usuario-controller.js";
import jwtAuthenticator from "../middlewares/jwt-autenticator.js";
import authorizer from "../middlewares/authorizer.js";
//aqui
const router = Router();

// Rotas públicas
router.post("/signup", signup);
router.post("/login", login);

// Protege todas as rotas abaixo com autenticação + verificação de ADMINISTRATOR
router.use(jwtAuthenticator);
router.use(authorizer("ADMINISTRATOR"));

// Rotas privadas
router.get("/", index);         // Listar todos
router.get("/:id", show);       // Buscar por ID
router.post("/", store);        // Criar
router.put("/:id", update);     // Atualizar
router.delete("/:id", destroy); // Deletar

export default router;
