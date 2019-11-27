import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './task.model';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.cto';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';

@Controller('tasks')
export class TasksController {
    constructor(private taskService: TasksService) {}

    @Get()
    getTasks(@Query(ValidationPipe) filterDto: GetTasksFilterDto): Task[] {
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
        @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    ): Task {
        return this.taskService.modifyTask(id, status);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createTask(@Body() createTaskDto: CreateTaskDto): Task {
        return this.taskService.createTask(createTaskDto);
    }
}
