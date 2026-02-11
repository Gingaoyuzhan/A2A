import { IsString, IsNotEmpty, IsIn } from 'class-validator';

/**
 * 开始战斗请求 DTO
 */
export class StartBattleDto {
  @IsString()
  @IsNotEmpty({ message: '简历内容不能为空' })
  resume: string;

  @IsString()
  @IsNotEmpty({ message: '职位描述不能为空' })
  jd: string;

  @IsString()
  @IsIn(['easy', 'hard'], { message: '难度模式只能是 easy 或 hard' })
  mode: 'easy' | 'hard';
}

/**
 * 战斗回合数据
 */
export interface BattleTurn {
  round: number;
  interviewer: string;
  candidate: string;
  damageToCandidate: number;
  damageToInterviewer: number;
}

/**
 * 战斗状态
 */
export interface BattleState {
  id: string;
  resume: string;
  jd: string;
  mode: 'easy' | 'hard';
  interviewerHP: number;
  candidateHP: number;
  currentRound: number;
  turns: BattleTurn[];
  isActive: boolean;
  createdAt: number;
}

/**
 * 战斗结果
 */
export interface BattleResult {
  winRate: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
  strengths: string[];
  weaknesses: string[];
}

/**
 * SSE 事件类型
 */
export type BattleEventType =
  | 'battle_start'
  | 'interviewer_attack'
  | 'candidate_defend'
  | 'damage'
  | 'round_end'
  | 'battle_end';

/**
 * SSE 事件数据
 */
export interface BattleEvent {
  type: BattleEventType;
  data: {
    round?: number;
    message?: string;
    sender?: 'interviewer' | 'candidate';
    damage?: number;
    target?: 'interviewer' | 'candidate';
    hp?: { interviewer: number; candidate: number };
    result?: BattleResult;
  };
}
