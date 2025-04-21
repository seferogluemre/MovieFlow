import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

enum LogLevel {
  INFO = "INFO",
  ERROR = "ERROR",
  WARN = "WARN",
}

// Logs klasörünün varlığını kontrol et ve yoksa oluştur
const logsDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(__dirname, "../../logs/app.log");

const writeLog = (level: LogLevel, message: string, error?: Error) => {
  const timestamp = new Date().toISOString();
  const errorMessage = error
    ? ` | Error: ${error.message} | Stack: ${error.stack}`
    : "";
  const logMessage = `[${level}] ${timestamp} - ${message}${errorMessage}\n`;

  fs.appendFileSync(logFilePath, logMessage);
};

export const logInfo = (message: string) => writeLog(LogLevel.INFO, message);
export const logError = (message: string, error?: Error) =>
  writeLog(LogLevel.ERROR, message, error);
export const logWarn = (message: string) => writeLog(LogLevel.WARN, message);
