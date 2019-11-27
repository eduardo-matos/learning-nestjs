import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.cto';

@Controller('tasks')
export class TasksController {
    constructor(private taskService: TasksService) {}

    @Get()
    getTasks(@Query() filterDto: GetTasksFilterDto): Task[] {
        return this.taskService.getTasks(filterDto);
    }

    @Get(':id')
    getTaskById(@Param('id') id: string): Task {
        return this.taskService.getTaskById(id);
    }

    @Delete(':id')
    deleteTaskById(@Param('id') id: string): Task {
        return this.taskService.deleteTaskById(id);
    }

    @Patch(':id/status')
    modifyTask(
        @Param('id') id: string,
        @Body('status') status: TaskStatus,
    ): Task {
        return this.taskService.modifyTask(id, status);
    }

    @Post()
    createTask(@Body() createTaskDto: CreateTaskDto): Task {
        return this.taskService.createTask(createTaskDto);
    }
}
