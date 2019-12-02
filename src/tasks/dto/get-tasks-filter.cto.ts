import { IsOptional, IsIn } from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class GetTasksFilterDto {
    @IsOptional()
    @IsIn(Object.keys(TaskStatus))
    status?: TaskStatus;

    @IsOptional()
    search?: string;
}
