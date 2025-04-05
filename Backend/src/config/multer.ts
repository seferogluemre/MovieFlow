import multer from "multer";
import path from 'path'

export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../', 'public', 'uploads');
        cb(null, uploadPath);
        console.log(__dirname)
        console.log(uploadPath)
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});