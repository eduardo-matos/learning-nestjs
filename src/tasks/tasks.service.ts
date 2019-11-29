import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.cto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { Like } from 'typeorm';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskRepository)
        private taskRepository: TaskRepository
    ) {}

    async getTasks(filter: GetTasksFilterDto, user: User): Promise<Task[]> {
        const { status, search } = filter;

        let query = this.taskRepository.createQueryBuilder().where('userid = :userid', { userid: user.id });

        if (status) {
            query = query.andWhere('status = :status', { status });
        }

        if (search) {
            query = query.andWhere(
                '(title like :title OR description like :description)',
                { title: `%${search}%`, description: `%${search}%` },
            );
        }

        return query.getMany();
    }

    async getTaskById(id: number, user: User): Promise<Task> {
        const task = await this.taskRepository.findOne({ id , user });

        if (!task) {
            throw new NotFoundException();
        }

        return task;
    }

    async deleteTaskById(id: number, user: User): Promise<boolean> {
        const result = await this.taskRepository.delete({ id, userid: user.id });
        return !!result.affected;
    }

    async modifyTask(id: number, status: TaskStatus, user: User): Promise<Task> {
        await this.taskRepository.update({ id, user }, { status });
        return await this.taskRepository.findOne({ id, user });
    }

    async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
        const { title, description } = createTaskDto;
        
        const task = new Task();
        task.description = description;
        task.title = title;
        task.status = TaskStatus.OPEN;
        task.user = user;
        await task.save();

        return task;
    }
}
