import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import * as uuid from 'uuid/v4';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.cto';

@Injectable()
export class TasksService {
    private tasks: Task[] = [];

    getTasks(filter: GetTasksFilterDto): Task[] {
        const { status, search } = filter;

        if (!status && !search) {
            return this.tasks;
        }

        let tasks: Task[] = [];

        console.log(filter);
        if (status) {
            tasks.push(...this.tasks.filter(task => task.status === status));
        }

        if (search) {
            tasks.push(...this.tasks.filter(task => task.title.includes(status) || task.description.includes(status)));
        }

        return tasks;
    }

    getTaskById(id: string): Task {
        return this.tasks.find(task => task.id === id);
    }

    deleteTaskById(id: string): Task {
        const task = this.getTaskById(id);
        this.tasks = this.tasks.filter(task => task.id !== id);
        return task;
    }

    modifyTask(id: string, status: TaskStatus): Task {
        const task = this.getTaskById(id);
        task.status = status;

        return task;
    }

    createTask(createTaskDto: CreateTaskDto) {
        const { title, description } = createTaskDto;

        const task = {
            id: uuid(),
            title,
            description,
            status: TaskStatus.OPEN,
        };

        this.tasks.push(task);
        return task;
    }
}
