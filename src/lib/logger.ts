import { appendFile, mkdir } from 'fs/promises';
import { join } from 'path';

export class Logger {
  private static instance: Logger;
  private logDir = './var';

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  async logAccess(method: string, url: string, status: number, responseTime: number, ip: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const logLine = `${timestamp} ${method} ${url} ${status} ${responseTime}ms ${ip}\n`;
    
    await this.ensureLogDir();
    await appendFile(join(this.logDir, 'access.log'), logLine);
  }

  async logError(error: Error, context?: Record<string, unknown>): Promise<void> {
    const timestamp = new Date().toISOString();
    const sanitizedContext = this.sanitizeContext(context);
    const logLine = `${timestamp} ERROR ${error.message} ${error.stack || ''} ${JSON.stringify(sanitizedContext)}\n`;
    
    await this.ensureLogDir();
    await appendFile(join(this.logDir, 'error.log'), logLine);
  }

  async appendCsvLine(filename: string, data: Record<string, unknown>): Promise<void> {
    await this.ensureLogDir();
    const filepath = join(this.logDir, filename);
    const csvLine = Object.values(data).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\n';
    await appendFile(filepath, csvLine);
  }

  private async ensureLogDir(): Promise<void> {
    await mkdir(this.logDir, { recursive: true });
  }

  private sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> {
    if (!context) return {};
    
    const sanitized = { ...context };
    
    // Redact sensitive fields
    const sensitiveFields = ['email', 'phone', 'password', 'token', 'secret'];
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    }
    
    return sanitized;
  }
}