import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import * as express from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

@Controller('voice')
export class VoiceController {
  @Get('widget')
  async getWidget(@Res() res: express.Response) {
    let filePath = join(process.cwd(), 'voice_mentor.py');
    if (!existsSync(filePath)) {
      filePath = join(process.cwd(), '../../voice_mentor.py');
    }

    try {
      if (!existsSync(filePath)) {
        res.status(HttpStatus.NOT_FOUND).send('voice_mentor.py template file not found.');
        return;
      }

      const content = readFileSync(filePath, 'utf-8');
      // Match python multi-line string for VOICE_WIDGET_HTML
      const match = content.match(/VOICE_WIDGET_HTML = """([\s\S]*?)"""/);
      if (match && match[1]) {
        let html = match[1];
        const groqKey = process.env.GROQ_API_KEY || '';
        html = html.replace('%%GROQ_KEY%%', groqKey);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Could not parse VOICE_WIDGET_HTML template.');
      }
    } catch (err) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error serving widget: ' + err.message);
    }
  }
}
