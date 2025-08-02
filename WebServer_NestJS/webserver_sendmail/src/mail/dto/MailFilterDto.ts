import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsString } from 'class-validator';

export class MailFilterDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  box?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  fromDate?: string; // ISO string

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasAttachment?: boolean;
}
