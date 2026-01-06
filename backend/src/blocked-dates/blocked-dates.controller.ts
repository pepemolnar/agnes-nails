import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BlockedDatesService } from './blocked-dates.service';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';
import { UpdateBlockedDateDto } from './dto/update-blocked-date.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('blocked-dates')
export class BlockedDatesController {
  constructor(private readonly blockedDatesService: BlockedDatesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createBlockedDateDto: CreateBlockedDateDto) {
    return this.blockedDatesService.create(createBlockedDateDto);
  }

  @Get()
  findAll() {
    return this.blockedDatesService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blockedDatesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlockedDateDto: UpdateBlockedDateDto) {
    return this.blockedDatesService.update(+id, updateBlockedDateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blockedDatesService.remove(+id);
  }
}
