import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBlockedDateDto {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
