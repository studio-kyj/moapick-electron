import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  BaseEntity,
} from "typeorm";
import { User } from "./user.entity";

@Entity('Company')
export class Company extends BaseEntity{
  @PrimaryGeneratedColumn() // UUID로 자동 생성
  company_id: string;

  @Column()
  user_id: string;

  @Column() 
  companyName: string;

  @Column() //사업자번호
  eid: string;

  @Column({ default: "BASIC" }) //등급
  grade: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => User, (users) => users.user_id)
  users: User[];
}
