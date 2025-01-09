import e from "express";
import "dotenv/config";
import "./config/db.js";
import usuario_router from "./routers/usuario-router.js";
import produto_router from "./routers/produto-router.js";
import venda_router from "./routers/venda-router.js";
import pizza_router from "./routers/pizza-router.js";
import cliente_router from "./routers/cliente-router.js";




const app = e();
app.use(e.json());
app.use("/usuario", usuario_router);
app.use("/produtos", produto_router);
app.use("/vendas", venda_router);
app.use("/pizzas", pizza_router);
app.use("/clientes", cliente_router);
app.listen(process.env.API_PORT, () => console.log("Server Running"));