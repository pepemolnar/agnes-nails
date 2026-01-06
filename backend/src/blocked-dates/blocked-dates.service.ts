import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';
import { UpdateBlockedDateDto } from './dto/update-blocked-date.dto';
import { BlockedDate } from './entities/blocked-date.entity';

@Injectable()
export class BlockedDatesService {
  constructor(
    @InjectRepository(BlockedDate)
    private blockedDatesRepository: Repository<BlockedDate>,
  ) {}

  async create(createBlockedDateDto: CreateBlockedDateDto): Promise<BlockedDate> {
    // Check if date is already blocked
    const existing = await this.blockedDatesRepository.findOne({
      where: { date: createBlockedDateDto.date },
    });

    if (existing) {
      throw new ConflictException('This date is already blocked');
    }

    const blockedDate = this.blockedDatesRepository.create(createBlockedDateDto);
    return await this.blockedDatesRepository.save(blockedDate);
  }

  async findAll(): Promise<BlockedDate[]> {
    return await this.blockedDatesRepository.find({
      order: { date: 'ASC' },
    });
  }

  async findOne(id: number): Promise<BlockedDate> {
    const blockedDate = await this.blockedDatesRepository.findOne({
      where: { id },
    });
    if (!blockedDate) {
      throw new NotFoundException(`Blocked date with ID ${id} not found`);
    }
    return blockedDate;
  }

  async update(id: number, updateBlockedDateDto: UpdateBlockedDateDto): Promise<BlockedDate> {
    const blockedDate = await this.findOne(id);
    Object.assign(blockedDate, updateBlockedDateDto);
    return await this.blockedDatesRepository.save(blockedDate);
  }

  async remove(id: number): Promise<void> {
    const blockedDate = await this.findOne(id);
    await this.blockedDatesRepository.remove(blockedDate);
  }

  async isDateBlocked(date: string): Promise<boolean> {
    const blockedDate = await this.blockedDatesRepository.findOne({
      where: { date },
    });
    return !!blockedDate;
  }
}
