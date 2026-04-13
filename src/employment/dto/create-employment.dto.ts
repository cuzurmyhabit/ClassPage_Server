import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateEmploymentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  company: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  url?: string;
}
