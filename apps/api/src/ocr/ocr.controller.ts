import { Controller, Post, UseInterceptors, UploadedFile, HttpException, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, writeFileSync, unlinkSync } from 'fs';
import * as os from 'os';

@Controller('ocr')
export class OcrController {
  @Post('scan')
  @UseInterceptors(FileInterceptor('file'))
  async scanResume(@UploadedFile() file: any) {
    if (!file) {
      throw new HttpException('No file uploaded.', HttpStatus.BAD_REQUEST);
    }

    let pythonPath = join(process.cwd(), '.venv/bin/python');
    let scriptPath = join(process.cwd(), 'resume_scanner.py');
    if (!existsSync(pythonPath)) {
      pythonPath = join(process.cwd(), '../../.venv/bin/python');
      scriptPath = join(process.cwd(), '../../resume_scanner.py');
    }

    // Save buffer to temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = join(tempDir, `resume_${Date.now()}_${file.originalname}`);
    writeFileSync(tempFilePath, file.buffer);

    return new Promise((resolve, reject) => {
      const pyProcess = spawn(pythonPath, [scriptPath, tempFilePath]);
      let stdoutData = '';
      let stderrData = '';

      pyProcess.stdout.on('data', (chunk) => {
        stdoutData += chunk.toString();
      });

      pyProcess.stderr.on('data', (chunk) => {
        stderrData += chunk.toString();
      });

      pyProcess.on('close', (code) => {
        // Clean up temp file
        try {
          if (existsSync(tempFilePath)) {
            unlinkSync(tempFilePath);
          }
        } catch (e) {
          console.error('Failed to delete temp file:', tempFilePath, e);
        }

        if (code !== 0) {
          console.error('Python scanner failed:', stderrData);
          reject(new HttpException(`OCR failed: ${stderrData}`, HttpStatus.INTERNAL_SERVER_ERROR));
          return;
        }

        try {
          const parsed = JSON.parse(stdoutData.trim());
          if (parsed.success) {
            resolve({ text: parsed.text });
          } else {
            reject(new HttpException(parsed.error || 'Failed to extract text.', HttpStatus.BAD_REQUEST));
          }
        } catch (err) {
          console.error('Failed to parse Python output:', stdoutData);
          reject(new HttpException('Failed to parse OCR response.', HttpStatus.INTERNAL_SERVER_ERROR));
        }
      });
    });
  }
}
