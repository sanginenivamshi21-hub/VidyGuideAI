import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@Controller('mentor')
export class MentorController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  async askMentor(@Body() body: any) {
    const question = body.question || '';
    const replyLang = body.reply_language || 'en';

    const langInstructions: Record<string, string> = {
      en: 'Reply in English.',
      te: 'IMPORTANT: Reply ONLY in Telugu (తెలుగు). Do not use English at all.',
      hi: 'IMPORTANT: Reply ONLY in Hindi (हिन्दी). Do not use English at all.',
      ta: 'IMPORTANT: Reply ONLY in Tamil (தமிழ்). Do not use English at all.',
      kn: 'IMPORTANT: Reply ONLY in Kannada (ಕನ್ನಡ). Do not use English at all.',
      ml: 'IMPORTANT: Reply ONLY in Malayalam (മലയാളം). Do not use English at all.',
      mr: 'IMPORTANT: Reply ONLY in Marathi (मराठी). Do not use English at all.',
      bn: 'IMPORTANT: Reply ONLY in Bengali (বাংলা). Do not use English at all.',
      gu: 'IMPORTANT: Reply ONLY in Gujarati (ગુજરાતી). Do not use English at all.',
      pa: 'IMPORTANT: Reply ONLY in Punjabi (ਪੰਜਾਬੀ). Do not use English at all.',
      or: 'IMPORTANT: Reply ONLY in Odia (ଓଡ଼ିଆ). Do not use English at all.',
      ur: 'IMPORTANT: Reply ONLY in Urdu (اردو). Do not use English at all.',
    };

    const langInstr = langInstructions[replyLang] || langInstructions.en;

    const systemPrompt = `You are VidyGuide AI Mentor — a warm, experienced career counselor for Indian students and young professionals. Give clear, practical, actionable career advice. Be encouraging but honest. End with one concrete next step. ${langInstr}`;

    const responseText = await this.aiService.generateText(systemPrompt, question, 0.7);
    return { response: responseText };
  }

  @Post('interview')
  async askInterview(@Body() body: any) {
    const role = body.role || 'Software Developer';
    const company = body.company || 'General MNC';

    const systemPrompt = `You are an expert interviewer for Indian jobs. Generate exactly 5 relevant, realistic interview questions (mix of technical and behavioral) for the role of ${role} at ${company}. Keep them concise.`;
    const responseText = await this.aiService.generateText(systemPrompt, 'Generate the questions.', 0.8);
    
    // Split into array by numbering
    const questions = responseText
      .split(/\n\d\.\s+/)
      .map(q => q.trim())
      .filter(q => q.length > 0);

    return { questions: questions.slice(0, 5) };
  }

  @Post('interview/feedback')
  async getInterviewFeedback(@Body() body: any) {
    const items = body.items || []; // Array of { question, answer }
    
    let promptContent = 'Provide comprehensive feedback and score (out of 10) for each answer. Provide the ideal sample response:\n\n';
    items.forEach((item: any, idx: number) => {
      promptContent += `Q${idx + 1}: ${item.question}\nAnswer: ${item.answer}\n\n`;
    });

    const systemPrompt = `You are an elite corporate interviewer. Evaluate the candidate's interview responses carefully. Point out weaknesses, score each response out of 10, and provide the ideal concise model answer.`;
    const responseText = await this.aiService.generateText(systemPrompt, promptContent, 0.6);

    return { feedback: responseText };
  }
}
