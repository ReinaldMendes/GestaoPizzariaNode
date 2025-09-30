import { Router } from "express";
import {
  index,
  show,
  store,
  update,
  destroy,
} from "../controllers/produtos-controller.js";
import jwtAuthenticator from "../middlewares/jwt-autenticator.js";
import authorizer from "../middlewares/authorizer.js";

const router = Router();

// Todas as rotas exigem usuário logado
router.use(jwtAuthenticator);

// Rotas acessíveis a qualquer usuário autenticado
router.get("/", index); 
router.get("/:id([0-9a-fA-F]{24})", show);

// Rotas restritas a ADMINISTRATOR
router.post("/", authorizer("ADMINISTRATOR"), store);
router.put("/:id", authorizer("ADMINISTRATOR"), update);
router.delete("/:id", authorizer("ADMINISTRATOR"), destroy);

export default router;
