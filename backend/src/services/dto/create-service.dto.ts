import { IsString, IsInt, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
