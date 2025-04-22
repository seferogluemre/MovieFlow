import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multerS3 from "multer-s3";
import path from "path";
import s3 from "./aws.config";

export const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME || "",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(
      null,
      "uploads/" + Date.now().toString() + path.extname(file.originalname)
    );
  },
});

export const profileS3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME || "",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(
      null,
      "profiles/" + Date.now().toString() + path.extname(file.originalname)
    );
  },
});

export const postersS3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME || "",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(
      null,
      "posters/" + Date.now().toString() + path.extname(file.originalname)
    );
  },
});

// Actors images upload configuration for S3
export const actorsS3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME || "",
  metadata: function (req, file, cb) {
    cb(null, { fieldName: file.fieldname });
  },
  key: function (req, file, cb) {
    cb(
      null,
      "actors/" + Date.now().toString() + path.extname(file.originalname)
    );
  },
});

export const getS3FileUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME || "",
    Key: key,
  });

  // Create a presigned URL with 7-day expiration (604800 seconds)
  const url = await getSignedUrl(s3, command, { expiresIn: 604800 });
  return url;
};
