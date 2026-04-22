import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BootstrapAdminDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}
