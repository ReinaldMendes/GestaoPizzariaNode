import e from "express";
import cors from "cors";             // <-- Importa cors
import "dotenv/config";
import "./config/db.js";
import usuario_router from "./routers/usuario-router.js";
import produto_router from "./routers/produto-router.js";
import venda_router from "./routers/venda-router.js";
import pizza_router from "./routers/pizza-router.js";
import cliente_router from "./routers/cliente-router.js";
import dashboardRoutes from './routers/dashboard-routes.js';
const app = e();

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174','https://gestaopizzarianode-1.onrender.com'];
;

app.use(cors({
    origin: function(origin, callback){
      if(!origin) return callback(null, true); // permite Postman etc
      if(allowedOrigins.indexOf(origin) === -1){
        console.warn('Origem não permitida pelo CORS: ' + origin);
        return callback(null, false); // Rejeita o CORS mas não retorna erro
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

app.use(e.json());
app.use("/vendas", venda_router);
app.use("/usuario", usuario_router);
app.use("/produtos", produto_router);
app.use("/pizzas", pizza_router);
app.use("/clientes", cliente_router);

app.use('/dashboard', dashboardRoutes);
app.listen(process.env.API_PORT, () => console.log("Server Running"));
