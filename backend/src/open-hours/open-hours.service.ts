import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOpenHourDto } from './dto/create-open-hour.dto';
import { UpdateOpenHourDto } from './dto/update-open-hour.dto';
import { OpenHour } from './entities/open-hour.entity';

@Injectable()
export class OpenHoursService {
  constructor(
    @InjectRepository(OpenHour)
    private openHoursRepository: Repository<OpenHour>,
  ) {}

  async create(createOpenHourDto: CreateOpenHourDto): Promise<OpenHour> {
    const existing = await this.openHoursRepository.findOne({
      where: { dayOfWeek: createOpenHourDto.dayOfWeek },
    });

    if (existing) {
      throw new ConflictException('Open hours for this day already exists');
    }

    const openHour = this.openHoursRepository.create(createOpenHourDto);
    return await this.openHoursRepository.save(openHour);
  }

  async findAll(): Promise<OpenHour[]> {
    return await this.openHoursRepository.find({
      order: { dayOfWeek: 'ASC' },
    });
  }

  async findOne(id: number): Promise<OpenHour> {
    const openHour = await this.openHoursRepository.findOne({
      where: { id },
    });
    if (!openHour) {
      throw new NotFoundException(`Open hour with ID ${id} not found`);
    }
    return openHour;
  }

  async findByDay(dayOfWeek: number): Promise<OpenHour | null> {
    return await this.openHoursRepository.findOne({
      where: { dayOfWeek },
    });
  }

  async update(id: number, updateOpenHourDto: UpdateOpenHourDto): Promise<OpenHour> {
    const openHour = await this.findOne(id);
    Object.assign(openHour, updateOpenHourDto);
    return await this.openHoursRepository.save(openHour);
  }

  async updateByDay(dayOfWeek: number, updateOpenHourDto: UpdateOpenHourDto): Promise<OpenHour> {
    const openHour = await this.findByDay(dayOfWeek);
    if (!openHour) {
      throw new NotFoundException(`Open hour for day ${dayOfWeek} not found`);
    }
    Object.assign(openHour, updateOpenHourDto);
    return await this.openHoursRepository.save(openHour);
  }

  async remove(id: number): Promise<void> {
    const openHour = await this.findOne(id);
    await this.openHoursRepository.remove(openHour);
  }

  async initializeDefaultHours(): Promise<void> {
    const existingHours = await this.findAll();
    if (existingHours.length > 0) {
      return;
    }

    const defaultHours = [
      { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '17:00' }, // Sunday
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '17:00' }, // Monday
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '17:00' }, // Tuesday
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '17:00' }, // Wednesday
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '17:00' }, // Thursday
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '17:00' }, // Friday
      { dayOfWeek: 6, isOpen: false, openTime: '09:00', closeTime: '17:00' }, // Saturday
    ];

    for (const hours of defaultHours) {
      await this.create(hours);
    }
  }

  async resetToDefaultHours(): Promise<void> {
    const existingHours = await this.findAll();
    for (const hour of existingHours) {
      await this.openHoursRepository.remove(hour);
    }

    const defaultHours = [
      { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { dayOfWeek: 6, isOpen: false, openTime: '09:00', closeTime: '17:00' },
    ];

    for (const hours of defaultHours) {
      await this.create(hours);
    }
  }
}
