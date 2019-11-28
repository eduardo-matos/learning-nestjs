import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.cto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { Like } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(TaskRepository)
        private taskRepository: TaskRepository
    ) {}

    getTasks(filter: GetTasksFilterDto): Promise<Task[]> {
        const { status, search } = filter;

        const where: { [key: string]: any }[] = [];

        if (status) {
            where.push({ status });
        }

        if (search) {
            where.push({ title: Like(`%${search}%`) }, { description: Like(`%${search}%`) });
        }

        return this.taskRepository.find({ where });
    }

    async getTaskById(id: number): Promise<Task> {
        const task = await this.taskRepository.findOne(id);

        if (!task) {
            throw new NotFoundException();
        }

        return task;
    }

    async deleteTaskById(id: number): Promise<boolean> {
        const result = await this.taskRepository.delete(id);
        return !!result.affected;
    }

    async modifyTask(id: number, status: TaskStatus): Promise<Task> {
        await this.taskRepository.update(id, { status });
        return await this.taskRepository.findOne(id);
    }

    async createTask(createTaskDto: CreateTaskDto): Promise<Task> {
        const { title, description } = createTaskDto;
        const task = this.taskRepository.save({ title, description, status: TaskStatus.OPEN });

        return task;
    }
}
