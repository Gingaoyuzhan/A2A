import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BattleState, BattleTurn, BattleResult, BattleEvent } from './battle.dto';
import { AiService } from '../ai/ai.service';
import { Subject } from 'rxjs';

/**
 * 战斗服务
 * 管理面试战斗的核心逻辑
 */
@Injectable()
export class BattleService {
  private readonly logger = new Logger(BattleService.name);
  // 内存存储战斗状态（生产环境应使用 Redis）
  private battles: Map<string, BattleState> = new Map();

  constructor(private readonly aiService: AiService) {}

  /**
   * 创建新战斗
   */
  createBattle(resume: string, jd: string, mode: 'easy' | 'hard'): BattleState {
    const battle: BattleState = {
      id: uuidv4(),
      resume,
      jd,
      mode,
      interviewerHP: 100,
      candidateHP: 100,
      currentRound: 0,
      turns: [],
      isActive: true,
      createdAt: Date.now(),
    };

    this.battles.set(battle.id, battle);
    this.logger.log(`Battle created: ${battle.id}, mode: ${mode}`);
    return battle;
  }

  /**
   * 获取战斗状态
   */
  getBattle(id: string): BattleState | undefined {
    return this.battles.get(id);
  }

  /**
   * 执行战斗流程，返回 SSE 事件流
   */
  async *executeBattle(battleId: string): AsyncGenerator<BattleEvent> {
    const battle = this.battles.get(battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    // 发送战斗开始事件
    yield {
      type: 'battle_start',
      data: {
        message: '正在分析候选人简历...',
        hp: { interviewer: battle.interviewerHP, candidate: battle.candidateHP },
      },
    };

    // 生成面试问答
    const totalRounds = battle.mode === 'easy' ? 3 : 5;

    for (let round = 1; round <= totalRounds; round++) {
      if (!battle.isActive) break;

      battle.currentRound = round;

      // 生成面试官问题
      const question = await this.aiService.generateInterviewerQuestion(
        battle.resume,
        battle.jd,
        battle.mode,
        round,
        battle.turns,
      );

      yield {
        type: 'interviewer_attack',
        data: {
          round,
          message: question,
          sender: 'interviewer',
        },
      };

      // 计算对候选人的伤害
      const damageToCandidate = this.calculateDamage(battle.mode, 'interviewer', round);
      battle.candidateHP = Math.max(0, battle.candidateHP - damageToCandidate);

      yield {
        type: 'damage',
        data: {
          damage: damageToCandidate,
          target: 'candidate',
          hp: { interviewer: battle.interviewerHP, candidate: battle.candidateHP },
        },
      };

      // 生成候选人回答
      const answer = await this.aiService.generateCandidateAnswer(
        battle.resume,
        battle.jd,
        question,
        battle.mode,
      );

      yield {
        type: 'candidate_defend',
        data: {
          round,
          message: answer,
          sender: 'candidate',
        },
      };

      // 计算对面试官的伤害
      const damageToInterviewer = this.calculateDamage(battle.mode, 'candidate', round);
      battle.interviewerHP = Math.max(0, battle.interviewerHP - damageToInterviewer);

      yield {
        type: 'damage',
        data: {
          damage: damageToInterviewer,
          target: 'interviewer',
          hp: { interviewer: battle.interviewerHP, candidate: battle.candidateHP },
        },
      };

      // 保存回合数据
      const turn: BattleTurn = {
        round,
        interviewer: question,
        candidate: answer,
        damageToCandidate,
        damageToInterviewer,
      };
      battle.turns.push(turn);

      yield {
        type: 'round_end',
        data: {
          round,
          hp: { interviewer: battle.interviewerHP, candidate: battle.candidateHP },
        },
      };

      // 检查是否有一方 HP 归零
      if (battle.candidateHP <= 0 || battle.interviewerHP <= 0) {
        break;
      }
    }

    // 生成战斗结果
    battle.isActive = false;
    const result = await this.generateResult(battle);

    yield {
      type: 'battle_end',
      data: {
        result,
        hp: { interviewer: battle.interviewerHP, candidate: battle.candidateHP },
      },
    };
  }

  /**
   * 计算伤害值
   */
  private calculateDamage(
    mode: 'easy' | 'hard',
    attacker: 'interviewer' | 'candidate',
    round: number,
  ): number {
    const baseMultiplier = mode === 'hard' ? 1.5 : 1;
    const roundMultiplier = 1 + round * 0.1;

    // 面试官伤害随回合递增，候选人伤害相对稳定
    if (attacker === 'interviewer') {
      return Math.floor((5 + Math.random() * 10) * baseMultiplier * roundMultiplier);
    } else {
      return Math.floor((8 + Math.random() * 12) * baseMultiplier);
    }
  }

  /**
   * 生成战斗结果
   */
  private async generateResult(battle: BattleState): Promise<BattleResult> {
    // 基于 HP 差值计算胜率
    const hpDiff = battle.candidateHP - battle.interviewerHP;
    const baseWinRate = 50 + hpDiff * 0.5;
    const winRate = Math.min(95, Math.max(5, baseWinRate));

    // 根据胜率确定评级
    let grade: BattleResult['grade'];
    if (winRate >= 90) grade = 'S';
    else if (winRate >= 80) grade = 'A';
    else if (winRate >= 70) grade = 'B';
    else if (winRate >= 60) grade = 'C';
    else if (winRate >= 50) grade = 'D';
    else grade = 'F';

    // 使用 AI 生成详细评价
    const evaluation = await this.aiService.generateEvaluation(battle);

    return {
      winRate: Math.round(winRate),
      grade,
      summary: evaluation.summary,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
    };
  }

  /**
   * 清理过期战斗（超过 1 小时）
   */
  cleanupExpiredBattles(): void {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    for (const [id, battle] of this.battles) {
      if (now - battle.createdAt > oneHour) {
        this.battles.delete(id);
        this.logger.log(`Cleaned up expired battle: ${id}`);
      }
    }
  }
}
