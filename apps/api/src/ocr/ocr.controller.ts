import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { existsSync, writeFileSync, unlinkSync } from 'fs';
import * as os from 'os';

@Controller('ocr')
export class OcrController {
    private readonly logger = new Logger(OcrController.name);

    @Post('scan')
    @UseInterceptors(FileInterceptor('file'))
    async scanResume(@UploadedFile() file: any) {
        if (!file) {
            throw new HttpException(
                'No file uploaded.',
                HttpStatus.BAD_REQUEST,
            );
        }

        const projectRoot = resolve(process.cwd(), '..', '..');
        const venvPython = resolve(projectRoot, '.venv', 'bin', 'python');
        const scriptPath = resolve(projectRoot, 'resume_scanner.py');

        const pythonPath = existsSync(venvPython) ? venvPython : 'python3';
        const script = existsSync(scriptPath)
            ? scriptPath
            : resolve(process.cwd(), 'resume_scanner.py');

        const tempDir = os.tmpdir();
        const tempFilePath = resolve(
            tempDir,
            `resume_${Date.now()}_${file.originalname}`,
        );
        writeFileSync(tempFilePath, file.buffer);

        return new Promise((resolve, reject) => {
            const pyProcess = spawn(pythonPath, [script, tempFilePath]);
            let stdoutData = '';
            let stderrData = '';

            pyProcess.stdout.on('data', (chunk) => {
                stdoutData += chunk.toString();
            });

            pyProcess.stderr.on('data', (chunk) => {
                stderrData += chunk.toString();
            });

            pyProcess.on('close', (code) => {
                try {
                    if (existsSync(tempFilePath)) {
                        unlinkSync(tempFilePath);
                    }
                } catch (e) {
                    this.logger.error(
                        'Failed to delete temp file:',
                        tempFilePath,
                        e,
                    );
                }

                if (code !== 0) {
                    this.logger.error('Python scanner failed:', stderrData);
                    reject(
                        new HttpException(
                            `OCR failed`,
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        ),
                    );
                    return;
                }

                try {
                    const parsed = JSON.parse(stdoutData.trim());
                    if (parsed.success) {
                        resolve({ text: parsed.text });
                    } else {
                        reject(
                            new HttpException(
                                parsed.error || 'Failed to extract text.',
                                HttpStatus.BAD_REQUEST,
                            ),
                        );
                    }
                } catch {
                    this.logger.error(
                        'Failed to parse Python output:',
                        stdoutData,
                    );
                    reject(
                        new HttpException(
                            'Failed to parse OCR response.',
                            HttpStatus.INTERNAL_SERVER_ERROR,
                        ),
                    );
                }
            });
        });
    }
}
