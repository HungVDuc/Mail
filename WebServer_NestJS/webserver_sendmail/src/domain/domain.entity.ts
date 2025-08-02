import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('virtual_domains')
export class Domain {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ unique: true })
  name: string;
}
