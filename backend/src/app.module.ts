import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BattleModule } from './modules/battle/battle.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    BattleModule,
    AiModule,
  ],
})
export class AppModule {}
