import {
    Controller,
    Post,
    Body,
    HttpException,
    HttpStatus,
} from '@nestjs/common';

@Controller('translator')
export class TranslatorController {
    @Post()
    async translateText(@Body() body: any) {
        const text = body.text || '';
        const targetLang = body.target_lang || 'en';
        const sourceLang = body.source_lang || 'en';

        if (!text || !text.trim()) {
            return { translated: text };
        }

        if (targetLang === sourceLang || targetLang === 'en') {
            return { translated: text };
        }

        try {
            const chunks = this.splitTextIntoChunks(text, 2000);
            const translatedChunks = [];

            for (const chunk of chunks) {
                const translatedChunk = await this.fetchTranslation(
                    chunk,
                    targetLang,
                    sourceLang,
                );
                translatedChunks.push(translatedChunk);
            }

            return { translated: translatedChunks.join('\n\n') };
        } catch (error) {
            throw new HttpException(
                `Translation error: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private splitTextIntoChunks(text: string, chunkSize: number): string[] {
        const paragraphs = text.split('\n\n');
        const chunks: string[] = [];
        let currentChunk = '';

        for (const para of paragraphs) {
            if (currentChunk.length + para.length > chunkSize) {
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                    currentChunk = para;
                } else {
                    chunks.push(para.substring(0, chunkSize));
                }
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + para;
            }
        }

        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }

    private async fetchTranslation(
        text: string,
        targetLang: string,
        sourceLang: string,
    ): Promise<string> {
        const baseUrl = 'https://translate.googleapis.com/translate_a/single';
        const query = new URLSearchParams({
            client: 'gtx',
            sl: sourceLang,
            tl: targetLang,
            dt: 't',
            q: text.substring(0, 4000),
        });

        const response = await fetch(`${baseUrl}?${query.toString()}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });

        if (!response.ok) {
            throw new Error(
                `Google Translate returned status: ${response.status}`,
            );
        }

        const data = await response.json();
        let translated = '';

        if (data && data[0]) {
            for (const chunk of data[0]) {
                if (chunk && chunk[0]) {
                    translated += chunk[0];
                }
            }
        }

        return translated.trim();
    }
}
