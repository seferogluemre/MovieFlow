import fs from "fs";
import path from "path";

enum LogLevel {
  INFO = "INFO",
  ERROR = "ERROR",
  WARN = "WARN",
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