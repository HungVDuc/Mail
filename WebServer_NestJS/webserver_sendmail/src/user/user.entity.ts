import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('virtual_users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: true })
  mailPassword: string;

  @Column({ name: 'home_dir' })
  homeDir: string;

  @DeleteDateColumn({ nullable: true })
  deleteAt?: Date;
}
