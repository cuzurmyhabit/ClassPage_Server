import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Penalty } from '../entities/penalty.entity';
import { AuthModule } from '../auth/auth.module';
import { PenaltiesService } from './penalties.service';
import { PenaltiesController } from './penalties.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Penalty]), AuthModule],
  controllers: [PenaltiesController],
  providers: [PenaltiesService],
})
export class PenaltiesModule {}
