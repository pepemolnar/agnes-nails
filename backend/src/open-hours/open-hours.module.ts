import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpenHoursService } from './open-hours.service';
import { OpenHoursController } from './open-hours.controller';
import { OpenHour } from './entities/open-hour.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OpenHour])],
  controllers: [OpenHoursController],
  providers: [OpenHoursService],
  exports: [OpenHoursService],
})
export class OpenHoursModule {}
