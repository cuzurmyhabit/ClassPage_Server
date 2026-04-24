import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdatePenaltyDto {
  @IsOptional()
  @IsString()
  student_name?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  start_date?: string;

  @IsOptional()
  @IsString()
  end_date?: string;

  @IsOptional()
  @IsIn(['open', 'resolved', 'waived'])
  status?: 'open' | 'resolved' | 'waived';
}
