import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePenaltyDto {
  @IsString()
  @IsNotEmpty()
  student_name: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  week_start?: string;
}
