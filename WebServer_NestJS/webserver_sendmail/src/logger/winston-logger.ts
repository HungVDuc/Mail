import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as path from 'path';

const logDir = 'logs';

// Tạo thư mục nếu chưa có
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const transport = new winston.transports.DailyRotateFile({
  filename: `${logDir}/%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,         // nén file cũ
  maxSize: '20m',              // tối đa 20MB mỗi file
  maxFiles: '14d',             // giữ 14 ngày
  level: 'info',
});

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}] ${info.message}`),
  ),
  transports: [
    transport,
    new winston.transports.Console(), // cũng hiển thị ra console
  ],
});
