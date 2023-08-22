import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  BaseEntity,
  
} from "typeorm";
import { Company } from "./company.entity";

@Entity('User')
export class User extends BaseEntity{
  @PrimaryGeneratedColumn() // UUID로 자동 생성
  user_id: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Company, (company) => company.user_id)
  users: Company[];
}
