import e from "express";
import "dotenv/config";
import "./config/db.js";
import usuario_router from "./routers/usuario_router.js";


const app = e();
app.use(e.json());
app.use("/usuario", usuario_router);


app.listen(process.env.API_PORT, () => console.log("Server Running"));