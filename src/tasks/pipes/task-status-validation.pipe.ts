import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { TaskStatus } from "../task.model";

export class TaskStatusValidationPipe extends ValidationPipe implements ValidationPipe {
    readonly allowedStatuses = Object.values(TaskStatus);

    transform(value: any) {
        value = (value as string).toUpperCase();
        if (!this.isStatusValid(value)) {
            throw new BadRequestException(`\`${value}\` is not a valid status`);
        }

        return value;
    }

    isStatusValid(status: TaskStatus): boolean {
        return this.allowedStatuses.includes(status);
    }
}