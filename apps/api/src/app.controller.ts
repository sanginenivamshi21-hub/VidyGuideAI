import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma.service';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly prisma: PrismaService,
    ) {}

    @Get()
    getRoot() {
        return {
            status: 'ok',
            service: 'VidyGuideAI API',
        };
    }

    @Get('health')
    getHealth() {
        return {
            status: 'healthy',
        };
    }

    @Post('debug-db')
    async debugDb(@Body() body: any) {
        const query = body.query;
        try {
            const result = await this.prisma.$queryRawUnsafe(query);
            return { success: true, result };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    @Post('debug-ocr')
    async debugOcr() {
        const { execSync } = require('child_process');
        const results: any = {};
        
        // 1. Check if running in Docker container or native
        try {
            const cgroup = require('fs').readFileSync('/proc/1/cgroup', 'utf8');
            results.isDocker = cgroup.includes('docker') || cgroup.includes('kubepods') || require('fs').existsSync('/.dockerenv');
        } catch (e) {
            results.isDocker = require('fs').existsSync('/.dockerenv');
        }

        // 2. Locate python path used by the controller
        const resolve = require('path').resolve;
        const existsSync = require('fs').existsSync;
        const projectRoot = resolve(process.cwd(), '..', '..');
        const venvPython = resolve(projectRoot, '.venv', 'bin', 'python');
        const pythonPath = existsSync(venvPython) ? venvPython : 'python3';
        results.pythonPathUsed = pythonPath;

        // 3. Test python imports
        try {
            execSync(`${pythonPath} -c "import PIL; import pytesseract; import pdf2image; import pypdf; import reportlab"`);
            results.pythonImportsOk = true;
        } catch (e) {
            results.pythonImportsOk = false;
            results.pythonImportsError = (e as Error).message;
        }

        // 4. Test system binaries
        try {
            results.tesseractPath = execSync(`which tesseract || echo "not found"`).toString().trim();
        } catch (e) {
            results.tesseractPath = 'error';
        }
        try {
            results.pdftoppmPath = execSync(`which pdftoppm || echo "not found"`).toString().trim();
        } catch (e) {
            results.pdftoppmPath = 'error';
        }

        return results;
    }
}
