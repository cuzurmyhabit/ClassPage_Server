import { IsOptional, IsString } from 'class-validator';

export class UpdateSettingsDto {
  @IsString()
  @IsOptional()
  school_name?: string;

  @IsString()
  @IsOptional()
  class_name?: string;

  @IsString()
  @IsOptional()
  office_code?: string;

  @IsString()
  @IsOptional()
  office_name?: string;

  @IsString()
  @IsOptional()
  school_code?: string;

  @IsString()
  @IsOptional()
  school_display_name?: string;

  @IsString()
  @IsOptional()
  schedule_source?: string;
}
