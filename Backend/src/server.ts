import express from 'express'
import rateLimit from "express-rate-limit";
import cors from 'cors'
import helmet from 'helmet';
import dotenv from 'dotenv'
import user_routes from './routes/user.routes'
import auth_routes from './routes/auth.routes'

// Config options
const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 70,
    message: { error: "Çok fazla istek yaptınız, lütfen daha sonra tekrar deneyin." },
    headers: true,
    standardHeaders: true,
    legacyHeaders: false,
});
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

dotenv.config();
const app = express()
const port = process.env.PORT || 3000

app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter)
app.use(cors(corsOptions))

// Routes
app.use("/api/users", user_routes)
app.use("/api/auth", auth_routes)


app.listen(port, () => {
    console.log(`Sunucu ${port} çalışıyor...`)
})