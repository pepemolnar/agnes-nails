import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';
import axios from 'axios';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentsRepository: Repository<Appointment>,
  ) {}

  private async verifyRecaptcha(token: string): Promise<boolean> {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.warn('RECAPTCHA_SECRET_KEY not configured');
      return true; // Allow in development if not configured
    }

    try {
      const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        null,
        {
          params: {
            secret: secretKey,
            response: token,
          },
        }
      );

      return response.data.success === true;
    } catch (error) {
      console.error('reCAPTCHA verification error:', error);
      return false;
    }
  }

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Verify reCAPTCHA token
    const isValid = await this.verifyRecaptcha(createAppointmentDto.recaptchaToken);
    if (!isValid) {
      throw new BadRequestException('reCAPTCHA verification failed');
    }

    // Remove recaptchaToken from the data to be saved
    const { recaptchaToken, ...appointmentData } = createAppointmentDto;

    const appointment = this.appointmentsRepository.create(appointmentData);
    return await this.appointmentsRepository.save(appointment);
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, updateAppointmentDto);
    return await this.appointmentsRepository.save(appointment);
  }

  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentsRepository.remove(appointment);
  }
}
