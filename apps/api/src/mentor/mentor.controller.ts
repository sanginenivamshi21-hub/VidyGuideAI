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
    const experienceLevel = body.experience_level || 'Entry Level';
    const skills = body.skills || 'General technical skills';
    const difficulty = body.difficulty || 'Medium';

    const systemPrompt = `You are an expert corporate recruiter and interviewer for Indian companies (ranging from top tech like Google/Microsoft, IT services like TCS/Infosys, banking like SBI, to UPSC/Civil Services).
Generate exactly 5 highly relevant, realistic, and challenging interview questions for the following candidate profile:
- Role: ${role}
- Company: ${company}
- Experience Level: ${experienceLevel}
- Key Skills: ${skills}
- Difficulty Level: ${difficulty}

Keep the questions professional and realistic. Avoid generic questions. Return exactly 5 questions numbered 1 to 5. Format them strictly like this:
1. First question
2. Second question
3. Third question
4. Fourth question
5. Fifth question`;

    const responseText = await this.aiService.generateText(systemPrompt, 'Generate the questions.', 0.8);
    
    // Split into array by numbering, supporting both newlines and start of string
    const questions = responseText
      .split(/(?:\r?\n|^)\d+\.\s+/)
      .map(q => q.trim())
      .filter(q => q.length > 0);

    return { questions: questions.slice(0, 5) };
  }

  @Post('interview/feedback')
  async getInterviewFeedback(@Body() body: any) {
    const items = body.items || []; // Array of { question, answer }
    
    let promptContent = 'Provide comprehensive feedback, score (out of 10), strengths, weaknesses, and the ideal model response for the following answers:\n\n';
    items.forEach((item: any, idx: number) => {
      promptContent += `Q${idx + 1}: ${item.question}\nAnswer: ${item.answer}\n\n`;
    });

    const systemPrompt = `You are an elite corporate interviewer. Evaluate the candidate's interview responses.
Provide feedback in a premium, beautifully formatted conversational markdown layout:
- Score each question out of 10 (format as "**Score:** X/10").
- Use bullet points, bold key terms, and emojis where appropriate.
- List distinct strengths and weaknesses.
- Provide a concise, professional model answer that the candidate should use as a reference.
- End with a brief, encouraging tip or warning.`;

    const responseText = await this.aiService.generateText(systemPrompt, promptContent, 0.6);

    return { feedback: responseText };
  }
}
