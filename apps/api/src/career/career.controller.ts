import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@Controller('career')
export class CareerController {
  constructor(private readonly aiService: AiService) {}

  @Post()
  async suggestCareer(@Body() body: any) {
    const skills = body.skills || '';
    const interests = body.interests || '';
    const education = body.education || '';
    const educationLevel = body.education_level || '';
    const educationDetail = body.education_detail || '';
    const goal = body.goal || '';
    const location = body.location || '';
    const extraContext = body.extra_context || '';
    
    // Advanced profile properties
    const cgpa = body.cgpa || '';
    const languages = body.languages || '';
    const targetCompany = body.target_company || '';
    const preferredCountry = body.preferred_country || '';
    const dreamJob = body.dream_job || '';
    const expectedSalary = body.expected_salary || '';
    const studyHours = body.study_hours || '';
    const timeline = body.timeline || '';
    const linkedin = body.linkedin || '';
    const github = body.github || '';
    const leetcode = body.leetcode || '';
    const hackerrank = body.hackerrank || '';
    const projects = body.projects || '';
    const certificates = body.certificates || '';
    const strengths = body.strengths || '';
    const weaknesses = body.weaknesses || '';
    const replyLang = body.reply_language || 'en';

    const langInstructions: Record<string, string> = {
      en: '',
      te: '\nIMPORTANT: Write your ENTIRE response in Telugu (తెలుగు) only. Do not use English.',
      hi: '\nIMPORTANT: Write your ENTIRE response in Hindi (हिन्दी) only. Do not use English.',
      ta: '\nIMPORTANT: Write your ENTIRE response in Tamil (தமிழ்) only. Do not use English.',
      kn: '\nIMPORTANT: Write your ENTIRE response in Kannada (ಕನ್ನಡ) only. Do not use English.',
      ml: '\nIMPORTANT: Write your ENTIRE response in Malayalam (മലയാളം) only. Do not use English.',
      mr: '\nIMPORTANT: Write your ENTIRE response in Marathi (मராठी) only. Do not use English.',
      bn: '\nIMPORTANT: Write your ENTIRE response in Bengali (বাংলা) only. Do not use English.',
      gu: '\nIMPORTANT: Write your ENTIRE response in Gujarati (ગુજરાતી) only. Do not use English.',
      pa: '\nIMPORTANT: Write your ENTIRE response in Punjabi (ਪੰਜਾਬੀ) only. Do not use English.',
      or: '\nIMPORTANT: Write your ENTIRE response in Odia (ଓଡ଼ିଆ) only. Do not use English.',
      ur: '\nIMPORTANT: Write your ENTIRE response in Urdu (اردو) only. Do not use English.',
    };

    const langInstr = langInstructions[replyLang] || '';

    const systemPrompt = `You are VidyGuideAI, a compassionate, expert career counselor for Indian students and young professionals.
Provide highly structured, premium career advice using rich Markdown:
- Format titles and sections with beautiful headings (e.g. ## Career Path: [Title]).
- Use clear bullet points and bold key terms.
- Use emojis (e.g., 💼, 💰, 🎓, 📈) to make the content highly readable and scanner-friendly.
- Format structured metrics (e.g., Salary in India, Job Demand, Time to Income) using Markdown Tables for comparison.
- Use Callout blocks or blockquotes for important tips and warnings.
- Keep paragraphs short and simple so they are easy to read for beginners.`;

    const userPrompt = `Student Profile:
- Education Level: ${educationLevel} — ${education}
- Education Details: ${educationDetail} ${cgpa ? `(CGPA/Marks: ${cgpa})` : ''}
- Skills: ${skills} ${languages ? `(Programming Languages: ${languages})` : ''}
- Interests & Strengths: ${interests} ${strengths ? `| Strengths: ${strengths}` : ''}
- Goal & Dream Job: ${goal} ${dreamJob ? `(Target Dream Job: ${dreamJob})` : ''}
- Location & Preferred Country: ${location} ${preferredCountry ? `(Preferred Work Country: ${preferredCountry})` : ''}
- Expected Salary: ${expectedSalary} ${targetCompany ? `(Target Company: ${targetCompany})` : ''}
- Context & Weaknesses: ${extraContext} ${weaknesses ? `(Areas to improve: ${weaknesses})` : ''}
- Study Availability: ${studyHours ? `${studyHours} hours per day` : ''}
- Timeline Target: ${timeline || 'General'}
- Professional Portfolios: ${[linkedin, github, leetcode, hackerrank].filter(Boolean).join(' | ')}
- Current Projects & Certifications: ${[projects, certificates].filter(Boolean).join(' | ')}

Provide a highly customized, comprehensive Career Guidance Report covering exactly these sections:
1. **Career Analysis** — Analyze why their profile matches this path, pointing out strengths and areas to grow.
2. **Roadmap & Timeline** — A detailed step-by-step timeline matching their study schedule (e.g., Phase 1, Phase 2, Phase 3).
3. **Projects & Certificates** — Concrete project suggestions and industry-standard certifications they should target.
4. **Target Companies** — List matching Indian companies (MNCs/Startups/Govt bodies) hiring for this path.
5. **Interview Preparation** — Specific tips and resources for passing screening rounds.
6. **Resume Advice** — Advice on what sections to highlight.
7. **Final Action Plan** — A "Your Next 30 Days" plan with 3 concrete next steps. ${langInstr}`;

    const result = await this.aiService.generateText(systemPrompt, userPrompt, 0.7);
    return { career_suggestions: result };
  }

  @Post('roadmap')
  async generateRoadmap(@Body() body: any) {
    const text = body.text || '';
    const milestones = this.parseRoadmap(text);
    return { milestones };
  }

  private parseRoadmap(text: string): any[] {
    const milestones: any[] = [];
    const seen = new Set<string>();

    const patterns = [
      { regex: /month\s*(\d+)\s*[:\-–]+\s*([^\n]{5,100})/gi, unit: 'Month', mul: 1.0 },
      { regex: /week\s*(\d+)\s*[:\-–]+\s*([^\n]{5,100})/gi, unit: 'Week', mul: 0.25 },
      { regex: /day\s*(\d+)\s*[:\-–]+\s*([^\n]{5,100})/gi, unit: 'Day', mul: 0.03 },
      { regex: /(?:step|phase|stage)\s*(\d+)\s*[:\-–]+\s*([^\n]{5,100})/gi, unit: 'Step', mul: 2.0 },
      { regex: /(?:first|next)\s+(\d+)\s+months?\s*[:\-–]+\s*([^\n]{5,100})/gi, unit: 'Month', mul: 1.0 },
      { regex: /\*{1,2}(?:step|phase|stage|month)?\s*(\d+)[.:\-–*]+\s*([^*\n]{5,100})/gi, unit: 'Step', mul: 2.0 }
    ];

    for (const pat of patterns) {
      let match;
      pat.regex.lastIndex = 0;
      while ((match = pat.regex.exec(text)) !== null) {
        const num = parseInt(match[1], 10);
        const title = match[2].replace(/^[-•*→▸]+\s*/, '').replace(/\*$/, '').trim().substring(0, 80);
        const key = title.substring(0, 25).toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);

        const type = this.classify(title);
        milestones.push({
          label: `${pat.unit} ${num}`,
          sort_key: num * pat.mul,
          title,
          type,
          icon: this.getIcon(type),
          color: this.getColor(type)
        });
      }
    }

    if (milestones.length === 0) {
      const numberedRegex = /(?:^|\n)\s*(?:\*{0,2}\d+[.)\-–]\*{0,2}\s*)(.{10,120})/g;
      let match;
      let i = 1;
      while ((match = numberedRegex.exec(text)) !== null && i <= 8) {
        const item = match[1].replace(/[*_]/g, '').trim();
        if (item.length < 8) continue;
        const type = this.classify(item);
        milestones.push({
          label: `Step ${i}`,
          sort_key: i,
          title: item.substring(0, 80),
          type,
          icon: this.getIcon(type),
          color: this.getColor(type)
        });
        i++;
      }
    }

    if (milestones.length === 0) {
      const bulletRegex = /(?:^|\n)\s*[-•*▸→]\s+(.{10,100})/g;
      let match;
      let i = 1;
      while ((match = bulletRegex.exec(text)) !== null && i <= 8) {
        const item = match[1].replace(/[*_]/g, '').trim();
        const type = this.classify(item);
        milestones.push({
          label: `Step ${i}`,
          sort_key: i,
          title: item.substring(0, 80),
          type,
          icon: this.getIcon(type),
          color: this.getColor(type)
        });
        i++;
      }
    }

    milestones.sort((a, b) => a.sort_key - b.sort_key);
    return milestones.slice(0, 10);
  }

  private classify(text: string): string {
    const t = text.toLowerCase();
    if (['learn','study','course','cert','skill','class','train'].some(w => t.includes(w))) return 'learn';
    if (['apply','job','interview','hire','placement','work','career'].some(w => t.includes(w))) return 'job';
    if (['build','project','portfolio','create','develop','make'].some(w => t.includes(w))) return 'build';
    if (['salary','₹','lpa','income','earn','pay','money'].some(w => t.includes(w))) return 'money';
    if (['exam','test','gate','upsc','ssc','neet','jee','ibps'].some(w => t.includes(w))) return 'exam';
    if (['intern','apprentice','trainee','experience'].some(w => t.includes(w))) return 'intern';
    return 'milestone';
  }

  private getIcon(type: string): string {
    const icons: Record<string, string> = { learn: '📚', job: '💼', build: '🔨', money: '💰', exam: '📝', intern: '🏢', milestone: '🎯' };
    return icons[type] || '🎯';
  }

  private getColor(type: string): string {
    const colors: Record<string, string> = { learn: '#5B9BD5', job: '#3DDC84', build: '#F0A500', money: '#2ECC71', exam: '#E74C3C', intern: '#C07FF0', milestone: '#3DDC84' };
    return colors[type] || '#3DDC84';
  }
}
