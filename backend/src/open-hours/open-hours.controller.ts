import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OpenHoursService } from './open-hours.service';
import { CreateOpenHourDto } from './dto/create-open-hour.dto';
import { UpdateOpenHourDto } from './dto/update-open-hour.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('open-hours')
export class OpenHoursController {
  constructor(private readonly openHoursService: OpenHoursService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createOpenHourDto: CreateOpenHourDto) {
    return this.openHoursService.create(createOpenHourDto);
  }

  @Get()
  findAll() {
    return this.openHoursService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.openHoursService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOpenHourDto: UpdateOpenHourDto) {
    return this.openHoursService.update(+id, updateOpenHourDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('day/:dayOfWeek')
  updateByDay(@Param('dayOfWeek') dayOfWeek: string, @Body() updateOpenHourDto: UpdateOpenHourDto) {
    return this.openHoursService.updateByDay(+dayOfWeek, updateOpenHourDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.openHoursService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('initialize')
  initializeDefaultHours() {
    return this.openHoursService.initializeDefaultHours();
  }

  @UseGuards(JwtAuthGuard)
  @Post('reset')
  resetToDefaultHours() {
    return this.openHoursService.resetToDefaultHours();
  }
}
