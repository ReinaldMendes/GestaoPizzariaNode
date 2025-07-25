import { Router } from "express";
import {
  index,
  show,
  store,
  updateRetirada,
  destroy,
} from "../controllers/venda-controller.js";
import jwtAuthenticator from "../middlewares/jwt-autenticator.js";
import authorizer from "../middlewares/authorizer.js";

const router = Router();

router.use(jwtAuthenticator);
router.use(authorizer("ADMINISTRATOR"));

router.get("/", index);
router.get("/:id", show);
router.post("/", store);
router.put("/:id/retirada", updateRetirada); // Novo endpoint
router.delete("/:id", destroy);

export default router;
