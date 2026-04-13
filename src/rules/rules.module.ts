import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rule } from '../entities/rule.entity';
import { AuthModule } from '../auth/auth.module';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Rule]), AuthModule],
  controllers: [RulesController],
  providers: [RulesService],
})
export class RulesModule {}
