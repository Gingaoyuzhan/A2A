import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { BattleService } from './battle.service';
import { StartBattleDto } from './battle.dto';
import { ApiResponse } from '../../common/dto';

/**
 * 战斗控制器
 * 处理面试战斗相关的 HTTP 请求
 */
@Controller('api/battle')
export class BattleController {
  private readonly logger = new Logger(BattleController.name);

  constructor(private readonly battleService: BattleService) {}

  /**
   * 开始新战斗
   * POST /api/battle/start
   */
  @Post('start')
  startBattle(@Body() dto: StartBattleDto) {
    this.logger.log(`Starting battle, mode: ${dto.mode}`);
    const battle = this.battleService.createBattle(dto.resume, dto.jd, dto.mode);

    return ApiResponse.success({
      battleId: battle.id,
      mode: battle.mode,
      hp: {
        interviewer: battle.interviewerHP,
        candidate: battle.candidateHP,
      },
    });
  }

  /**
   * 获取战斗状态
   * GET /api/battle/:id
   */
  @Get(':id')
  getBattle(@Param('id') id: string) {
    const battle = this.battleService.getBattle(id);
    if (!battle) {
      throw new HttpException('战斗不存在', HttpStatus.NOT_FOUND);
    }

    return ApiResponse.success({
      id: battle.id,
      mode: battle.mode,
      currentRound: battle.currentRound,
      hp: {
        interviewer: battle.interviewerHP,
        candidate: battle.candidateHP,
      },
      isActive: battle.isActive,
      turns: battle.turns,
    });
  }

  /**
   * SSE 流式传输战斗过程
   * GET /api/battle/:id/stream
   */
  @Get(':id/stream')
  async streamBattle(@Param('id') id: string, @Res() res: Response) {
    const battle = this.battleService.getBattle(id);
    if (!battle) {
      throw new HttpException('战斗不存在', HttpStatus.NOT_FOUND);
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    this.logger.log(`Starting battle stream: ${id}`);

    try {
      for await (const event of this.battleService.executeBattle(id)) {
        const data = JSON.stringify(event);
        res.write(`event: ${event.type}\n`);
        res.write(`data: ${data}\n\n`);
      }
    } catch (error) {
      this.logger.error(`Battle stream error: ${error}`);
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: '战斗执行出错' })}\n\n`);
    }

    res.end();
  }
}
