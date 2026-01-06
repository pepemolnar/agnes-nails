import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private servicesRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    const existing = await this.servicesRepository.findOne({
      where: { name: createServiceDto.name },
    });

    if (existing) {
      throw new ConflictException('Service with this name already exists');
    }

    const service = this.servicesRepository.create(createServiceDto);
    return await this.servicesRepository.save(service);
  }

  async findAll(): Promise<Service[]> {
    return await this.servicesRepository.find({
      order: { name: 'ASC' },
    });
  }

  async findAllActive(): Promise<Service[]> {
    return await this.servicesRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Service> {
    const service = await this.servicesRepository.findOne({
      where: { id },
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async update(id: number, updateServiceDto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);
    Object.assign(service, updateServiceDto);
    return await this.servicesRepository.save(service);
  }

  async remove(id: number): Promise<void> {
    const service = await this.findOne(id);
    await this.servicesRepository.remove(service);
  }

  async initializeDefaultServices(): Promise<void> {
    const existingServices = await this.findAll();
    if (existingServices.length > 0) {
      return;
    }

    const defaultServices = [
      { name: 'Classic Manicure', durationMinutes: 60, isActive: true },
      { name: 'Gel Manicure', durationMinutes: 120, isActive: true },
      { name: 'Gel Pedicure', durationMinutes: 120, isActive: true },
      { name: 'Acrylic Nails', durationMinutes: 120, isActive: true },
      { name: 'Nail Art Design', durationMinutes: 120, isActive: true },
    ];

    for (const service of defaultServices) {
      await this.create(service);
    }
  }
}
