import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/** 프론트에서 읽은 PDF (data URL + 메타) */
export class PdfFileDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Type(() => Number)
  @IsNumber()
  size: number;

  @IsString()
  @IsNotEmpty()
  dataUrl: string;

  @IsString()
  @IsNotEmpty()
  uploadedAt: string;
}
