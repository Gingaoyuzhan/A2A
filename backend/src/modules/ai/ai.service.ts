import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { BattleState, BattleTurn } from '../battle/battle.dto';

/**
 * AI 服务
 * 集成 OpenAI API 生成面试问答
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private model: string;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: this.configService.get<string>('OPENAI_BASE_URL'),
    });
    this.model = this.configService.get<string>('OPENAI_MODEL') || 'gpt-4';
  }

  /**
   * 生成面试官问题
   */
  async generateInterviewerQuestion(
    resume: string,
    jd: string,
    mode: 'easy' | 'hard',
    round: number,
    previousTurns: BattleTurn[],
  ): Promise<string> {
    const personality =
      mode === 'easy'
        ? '你是一位友善的 HR，提问风格温和，主要了解候选人的基本情况和职业规划。'
        : '你是一位严厉的技术面试官（阿里 P8 级别），擅长深挖技术细节，会针对简历中的项目经验进行压力测试。';

    const roundContext = this.getRoundContext(round, mode);
    const previousContext = previousTurns
      .map((t) => `Q${t.round}: ${t.interviewer}\nA${t.round}: ${t.candidate}`)
      .join('\n\n');

    const prompt = `${personality}

候选人简历：
${resume}

职位要求：
${jd}

${previousContext ? `之前的问答：\n${previousContext}\n\n` : ''}

${roundContext}

请生成一个面试问题。要求：
1. 问题要针对简历内容或职位要求
2. 问题要有深度，能考察候选人的真实能力
3. 只输出问题本身，不要有其他内容
4. 使用中文`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.8,
      });

      return response.choices[0]?.message?.content?.trim() || this.getFallbackQuestion(round);
    } catch (error) {
      this.logger.error(`Failed to generate question: ${error}`);
      return this.getFallbackQuestion(round);
    }
  }

  /**
   * 生成候选人回答
   */
  async generateCandidateAnswer(
    resume: string,
    jd: string,
    question: string,
    mode: 'easy' | 'hard',
  ): Promise<string> {
    const answerStyle =
      mode === 'easy'
        ? '回答风格自信但谦虚，展示基本能力即可。'
        : '回答风格专业且有深度，展示扎实的技术功底和实战经验，但偶尔也会有小瑕疵。';

    const prompt = `你是一位求职者，正在参加面试。

你的简历：
${resume}

应聘职位：
${jd}

面试官问题：${question}

${answerStyle}

请生成一个回答。要求：
1. 回答要基于简历内容，保持一致性
2. 回答要有条理，展示专业能力
3. 适当使用技术术语，但不要过度堆砌
4. 只输出回答本身，不要有其他内容
5. 使用中文
6. 控制在 200 字以内`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.7,
      });

      return response.choices[0]?.message?.content?.trim() || this.getFallbackAnswer();
    } catch (error) {
      this.logger.error(`Failed to generate answer: ${error}`);
      return this.getFallbackAnswer();
    }
  }

  /**
   * 生成面试评价
   */
  async generateEvaluation(
    battle: BattleState,
  ): Promise<{ summary: string; strengths: string[]; weaknesses: string[] }> {
    const turnsText = battle.turns
      .map((t) => `第${t.round}轮：\n问：${t.interviewer}\n答：${t.candidate}`)
      .join('\n\n');

    const prompt = `请分析以下面试对话，给出评价。

简历：
${battle.resume}

职位：
${battle.jd}

面试对话：
${turnsText}

请以 JSON 格式输出评价，包含：
1. summary: 一句话总结（50字以内）
2. strengths: 优势列表（2-3条）
3. weaknesses: 不足列表（2-3条）

只输出 JSON，不要有其他内容。`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
        temperature: 0.5,
      });

      const content = response.choices[0]?.message?.content?.trim() || '';
      // 尝试解析 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      this.logger.error(`Failed to generate evaluation: ${error}`);
    }

    return this.getFallbackEvaluation();
  }

  /**
   * 获取回合上下文提示
   */
  private getRoundContext(round: number, mode: 'easy' | 'hard'): string {
    if (mode === 'easy') {
      const contexts = [
        '这是第一轮，请提一个关于自我介绍或职业规划的问题。',
        '这是第二轮，请提一个关于项目经验的问题。',
        '这是第三轮，请提一个关于团队协作或软技能的问题。',
      ];
      return contexts[round - 1] || contexts[2];
    } else {
      const contexts = [
        '这是第一轮，请提一个基础技术问题，考察候选人的基本功。',
        '这是第二轮，请针对简历中的项目深挖技术细节。',
        '这是第三轮，请提一个系统设计或架构相关的问题。',
        '这是第四轮，请提一个压力场景问题，考察候选人的应变能力。',
        '这是最后一轮，请提一个综合性问题，考察候选人的全局思维。',
      ];
      return contexts[round - 1] || contexts[4];
    }
  }

  /**
   * 降级问题
   */
  private getFallbackQuestion(round: number): string {
    const questions = [
      '请简单介绍一下你自己，以及为什么对这个职位感兴趣？',
      '能详细说说你简历中提到的这个项目吗？你在其中负责什么？',
      '如果系统突然出现性能问题，你会如何排查和解决？',
      '你认为自己最大的优势和需要改进的地方是什么？',
      '你对未来的职业发展有什么规划？',
    ];
    return questions[(round - 1) % questions.length];
  }

  /**
   * 降级回答
   */
  private getFallbackAnswer(): string {
    return '这是一个很好的问题。基于我的经验，我认为关键在于理解业务需求和技术实现之间的平衡。在我之前的项目中，我们通过迭代优化的方式逐步解决了类似的挑战。';
  }

  /**
   * 降级评价
   */
  private getFallbackEvaluation(): { summary: string; strengths: string[]; weaknesses: string[] } {
    return {
      summary: '候选人表现中规中矩，有一定的技术基础，但深度有待加强。',
      strengths: ['沟通表达清晰', '有相关项目经验'],
      weaknesses: ['技术深度不足', '缺乏系统性思维'],
    };
  }
}
