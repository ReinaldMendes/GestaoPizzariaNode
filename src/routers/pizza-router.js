import { Router } from "express";
import {
  index,
  show,
  store,
  update,
  destroy,
} from "../controllers/pizza-controller.js";
import jwtAuthenticator from "../middlewares/jwt-autenticator.js";
import authorizer from "../middlewares/authorizer.js";

const router = Router();

router.use(jwtAuthenticator);
router.use(authorizer("ADMINISTRATOR"));

router.get("/", index); // Listar todas as pizzas
router.get("/:id", show); // Buscar uma pizza por ID
router.post("/", store); // Criar uma nova pizza
router.put("/:id", update); // Atualizar uma pizza por ID
router.delete("/:id", destroy); // Deletar uma pizza por ID

export default router;
