import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import s3 from "./aws.config";

// Check if we need to install multer-s3
// Run: npm install multer-s3 @types/multer-s3

// General upload storage configuration for S3
export const s3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME || "",
  acl: "public-read",
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

// Profile images upload configuration for S3
export const profileS3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME || "",
  acl: "public-read",
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

// Posters upload configuration for S3
export const postersS3Storage = multerS3({
  s3: s3,
  bucket: process.env.AWS_BUCKET_NAME || "",
  acl: "public-read",
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
  acl: "public-read",
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

// Helper function to get file URL from S3
export const getS3FileUrl = (key: string): string => {
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
