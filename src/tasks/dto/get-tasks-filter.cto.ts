import { TaskStatus } from "../task.model";
import { IsOptional, IsIP, IsIn } from "class-validator";

export class GetTasksFilterDto {
    @IsOptional()
    @IsIn(Object.keys(TaskStatus))
    status: TaskStatus;

    @IsOptional()
    search: string;
}