import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ImportEventItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  event_date: string;
}

export class ImportEventsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportEventItemDto)
  events: ImportEventItemDto[];

  @IsBoolean()
  replaceExisting: boolean;
}
