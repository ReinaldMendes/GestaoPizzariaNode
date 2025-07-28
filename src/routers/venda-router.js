import { Router } from "express";
import {
  index,
  show,
  store,
  updateRetirada,
  destroy,
  vendasMensal,
} from "../controllers/venda-controller.js";

const router = Router();

router.get("/mensal", vendasMensal);
router.get("/", index);
router.get("/:id([0-9a-fA-F]{24})", show);
router.post("/", store);
router.put("/:id([0-9a-fA-F]{24})/retirada", updateRetirada);
router.delete("/:id([0-9a-fA-F]{24})", destroy);

export default router;
