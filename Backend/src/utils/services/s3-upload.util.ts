import { logInfo, logWarn } from "@utils/logging/logger.util";
import AWS from "aws-sdk";
import fs from "fs";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../../", "public", "temp");

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

// Multer konfigürasyonu
export const upload = multer({ storage });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * Dosyayı S3'e yükler
 * @param file Multer tarafından sağlanan dosya
 * @param folderName S3'te yüklenecek klasör adı (profiles, posters, actors, vb.)
 * @returns Uploaded file key
 */
export const uploadToS3 = async (
  file: Express.Multer.File,
  folderName: string = "uploads"
): Promise<string> => {
  try {
    // Dosya içeriğini oku
    const fileContent = fs.readFileSync(file.path);

    // UUID ve orijinal uzantı ile yeni dosya adı oluştur
    const fileName = uuidv4() + path.extname(file.originalname);
    const key = `${folderName}/${fileName}`;

    // S3 yükleme parametreleri
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || "",
      Key: key,
      Body: fileContent,
      ContentType: file.mimetype,
    };

    await s3.upload(params).promise();

    fs.unlinkSync(file.path);

    logInfo(`File uploaded to S3: ${key}`);
    return key;
  } catch (error) {
    logWarn(`S3 upload error: ${(error as Error).message}`);
    throw new Error(`S3 upload failed: ${(error as Error).message}`);
  }
};

/**
 * S3'teki dosya için URL oluşturur
 * @param key S3 dosya yolu
 * @returns S3 URL
 */
export const getS3Url = (key: string): string | null => {
  if (!key) return null;

  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }

  try {
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${
      process.env.AWS_REGION || "eu-central-1"
    }.amazonaws.com/${key}`;
  } catch (error) {
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${
      process.env.AWS_REGION || "eu-central-1"
    }.amazonaws.com/${key}`;
  }
};

/**
 * S3'ten dosya siler
 * @param key S3 dosya yolu
 */
export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || "",
      Key: key,
    };

    await s3.deleteObject(params).promise();
    logInfo(`File deleted from S3: ${key}`);
  } catch (error) {
    logWarn(`S3 delete error: ${(error as Error).message}`);
    throw new Error(`S3 delete failed: ${(error as Error).message}`);
  }
};
