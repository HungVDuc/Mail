import { Module } from '@nestjs/common';
import { DomainService } from './domain.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Domain } from './domain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Domain])],
  providers: [DomainService],
  exports: [DomainService],
})
export class DomainModule {}
