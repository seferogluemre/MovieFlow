import express from 'express'
import rateLimit from "express-rate-limit";
import cors from 'cors'
import helmet from 'helmet';
import dotenv from 'dotenv'
import user_routes from './routes/user.routes'
import auth_routes from './routes/auth.routes'
import multer from 'multer'
import path from 'path'
import prismaClient from './config/db';

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'C:/Users/yunus/OneDrive/Masaüstü/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);
app.use(cors(corsOptions));

app.use('/uploads', express.static('C:/Users/yunus/OneDrive/Masaüstü/uploads'));

// Routes
app.use("/api/users", user_routes);
app.use("/api/auth", auth_routes);

// Fotoğraf yükleme ve profil fotoğrafını güncelleme rotası
app.post('/upload/:userId', upload.single('profileImage'), async (req, res) => {
    const { userId } = req.params;
    const { file } = req;

    if (!file) {
        return res.status(400).send('No file uploaded');
    }

    try {
        // Kullanıcıyı güncelle
        const updatedUser = await prismaClient.user.update({
            where: { id: parseInt(userId) },
            data: { profileImage: file.filename },
        });

        res.status(200).send(`Profile image updated for user ${updatedUser.username}`);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating user profile image');
    }
});

// Profil fotoğrafını alma rotası
app.get('/profile-image/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await prismaClient.user.findUnique({
            where: { id: parseInt(userId) },
        });

        if (!user || !user.profileImage) {
            return res.status(404).send('User or profile image not found');
        }

        const imagePath = path.join('C:/Users/yunus/OneDrive/Masaüstü/uploads');
        res.sendFile(imagePath);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving profile image');
    }
});

app.listen(port, () => {
    console.log(`Sunucu ${port} çalışıyor...`);
});