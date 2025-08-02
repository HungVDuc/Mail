import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Domain } from './domain.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DomainService {
  constructor(
    @InjectRepository(Domain) private readonly domainRepo: Repository<Domain>,
  ) {}

  async findAll() {
    return this.domainRepo.find();
  }

  async existsByName(name: string) {
    const domain = await this.domainRepo.findOneBy({ name });
    return domain ? true : false;
  }
}
