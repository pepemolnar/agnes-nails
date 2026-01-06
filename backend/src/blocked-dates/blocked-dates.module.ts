import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedDatesService } from './blocked-dates.service';
import { BlockedDatesController } from './blocked-dates.controller';
import { BlockedDate } from './entities/blocked-date.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockedDate])],
  controllers: [BlockedDatesController],
  providers: [BlockedDatesService],
  exports: [BlockedDatesService],
})
export class BlockedDatesModule {}
