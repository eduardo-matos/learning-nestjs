import { BaseEntity, PrimaryGeneratedColumn, Column, Entity, ManyToMany, ManyToOne, JoinColumn } from 'typeorm';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';

@Entity()
export class Task extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    status: TaskStatus;

    @ManyToOne(type => User, user => user.tasks, { eager: false })
    @JoinColumn({ name: 'userid' })
    user: User;

    @Column()
    userid: number;
}
