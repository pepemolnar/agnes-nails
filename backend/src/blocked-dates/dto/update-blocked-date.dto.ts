import { PartialType } from '@nestjs/mapped-types';
import { CreateBlockedDateDto } from './create-blocked-date.dto';

export class UpdateBlockedDateDto extends PartialType(CreateBlockedDateDto) {}
