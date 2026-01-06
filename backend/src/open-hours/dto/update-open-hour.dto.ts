import { PartialType } from '@nestjs/mapped-types';
import { CreateOpenHourDto } from './create-open-hour.dto';

export class UpdateOpenHourDto extends PartialType(CreateOpenHourDto) {}
