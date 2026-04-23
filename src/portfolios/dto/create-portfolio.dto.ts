import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PdfFileDto } from './pdf-file.dto';

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PdfFileDto)
  resume?: PdfFileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PdfFileDto)
  portfolio?: PdfFileDto;
}
