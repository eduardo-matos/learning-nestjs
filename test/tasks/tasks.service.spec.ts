import { TasksService } from '../../src/tasks/tasks.service';
import { Connection } from 'typeorm';
import { AuthService } from '../../src/auth/auth.service';
import { TaskStatus } from '../../src/tasks/task-status.enum';
import createApp from '../create-app';
import { NotFoundException, INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { TaskRepository } from '../../src/tasks/task.repository';

describe('TasksService', () => {
    let tasksService: TasksService;
    let authService: AuthService;
    let taskRepository: TaskRepository;
    let conn: Connection;
    let mod: TestingModule;
    let app: INestApplication;

    beforeAll(async () => {
        const nestApp = await createApp();
        mod = nestApp[0];
        app = nestApp[1];

        tasksService = await mod.get<TasksService>(TasksService);
        authService = await mod.get<AuthService>(AuthService);
        taskRepository = await mod.get<TaskRepository>(TaskRepository);
        conn = await mod.get<Connection>(Connection);
    });

    beforeEach(async () => {
        await conn.dropDatabase();
        await conn.synchronize();
    });

    afterAll(() => app.close());

    describe('GetTasks', () => {
        it('Returns tasks from specified user', async () => {
            const user1 = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            const user2 = await authService.signUpUser({ username: 'Silva', password: 'spam123' });
            await tasksService.createTask({ title: 'Foo', description: 'Bar' }, user1);
            await tasksService.createTask({ title: 'Baz', description: 'Qux' }, user2);

            const tasks = await tasksService.getTasks({}, user1);

            expect(tasks).toEqual([{
                id: expect.any(Number),
                title: 'Foo',
                description: 'Bar',
                status: TaskStatus.OPEN,
                userid: user1.id,
            }]);
        });

        it('Returns all tasks', async () => {
            const user = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            await tasksService.createTask({ title: 'Foo', description: 'Bar' }, user);
            await tasksService.createTask({ title: 'Baz', description: 'Qux' }, user);

            const tasks = await tasksService.getTasks({}, user);

            expect(tasks).toEqual([{
                id: expect.any(Number),
                title: 'Foo',
                description: 'Bar',
                status: TaskStatus.OPEN,
                userid: user.id,
            }, {
                id: expect.any(Number),
                title: 'Baz',
                description: 'Qux',
                status: TaskStatus.OPEN,
                userid: user.id,
            }]);
        });

        it('Filters by status', async () => {
            const user = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            const task1 = await tasksService.createTask({ title: 'Foo', description: 'Bar' }, user);
            const task2 = await tasksService.createTask({ title: 'Baz', description: 'Qux' }, user);

            task2.status = TaskStatus.IN_PROGRESS;
            await task2.save();

            const tasks = await tasksService.getTasks({ status: TaskStatus.IN_PROGRESS }, user);

            expect(tasks).toEqual([{
                id: expect.any(Number),
                title: 'Baz',
                description: 'Qux',
                status: TaskStatus.IN_PROGRESS,
                userid: user.id,
            }]);
        });

        it('Filters by title', async () => {
            const user = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            await tasksService.createTask({ title: 'Foo', description: 'Bar' }, user);
            await tasksService.createTask({ title: 'Baz', description: 'Qux' }, user);

            const tasks = await tasksService.getTasks({ search: 'Foo' }, user);

            expect(tasks).toEqual([{
                id: expect.any(Number),
                title: 'Foo',
                description: 'Bar',
                status: TaskStatus.OPEN,
                userid: user.id,
            }]);
        });

        it('Filters by description', async () => {
            const user = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            await tasksService.createTask({ title: 'Foo', description: 'Bar' }, user);
            await tasksService.createTask({ title: 'Baz', description: 'Qux' }, user);

            const tasks = await tasksService.getTasks({ search: 'Qux' }, user);

            expect(tasks).toEqual([{
                id: expect.any(Number),
                title: 'Baz',
                description: 'Qux',
                status: TaskStatus.OPEN,
                userid: user.id,
            }]);
        });

        it('Filters by title OR description', async () => {
            const user = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            await tasksService.createTask({ title: 'Lorem', description: 'Bar' }, user);
            await tasksService.createTask({ title: 'Baz', description: 'Lorem' }, user);

            const tasks = await tasksService.getTasks({ search: 'Lorem' }, user);

            expect(tasks).toEqual([{
                id: expect.any(Number),
                title: 'Lorem',
                description: 'Bar',
                status: TaskStatus.OPEN,
                userid: user.id,
            }, {
                id: expect.any(Number),
                title: 'Baz',
                description: 'Lorem',
                status: TaskStatus.OPEN,
                userid: user.id,
            }]);
        });

        it('Returns no results if status is not found regardless of search', async () => {
            const user = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            await tasksService.createTask({ title: 'Lorem', description: 'Bar' }, user);
            await tasksService.createTask({ title: 'Baz', description: 'Lorem' }, user);

            const tasks = await tasksService.getTasks({ search: 'Lorem', status: TaskStatus.IN_PROGRESS }, user);

            expect(tasks).toEqual([]);
        });

        it('Returns no results if task does not belong to user regardless of search', async () => {
            const user1 = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            const user2 = await authService.signUpUser({ username: 'Silva', password: 'spam123' });
            await tasksService.createTask({ title: 'Lorem', description: 'Bar' }, user2);
            await tasksService.createTask({ title: 'Baz', description: 'Lorem' }, user2);

            const tasks = await tasksService.getTasks({ search: 'Lorem' }, user1);

            expect(tasks).toEqual([]);
        });
    });

    describe('GetTaskById', () => {
        it('Return task for user', async () => {
            const user = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            const expectedTask = await tasksService.createTask({ title: 'Baz', description: 'Lorem' }, user);

            const actualTask = await tasksService.getTaskById(expectedTask.id, user);

            expect(expectedTask.id).toEqual(actualTask.id);
        });

        it('Throws error if user does not own task', async () => {
            const user1 = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            const user2 = await authService.signUpUser({ username: 'Silva', password: 'spam123' });
            const task = await tasksService.createTask({ title: 'Baz', description: 'Lorem' }, user1);

            await expect(tasksService.getTaskById(task.id, user2)).rejects.toBeInstanceOf(NotFoundException);
        });
    });

    describe('DeleteTaskById', () => {
        it('Deletes user\'s task', async () => {
            const user = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            const task = await tasksService.createTask({ title: 'Baz', description: 'Lorem' }, user);

            await tasksService.deleteTaskById(task.id, user);

            expect(await taskRepository.find({ id: task.id })).toEqual([]);
        });

        it('Does not delete task from another user', async () => {
            const user1 = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            const user2 = await authService.signUpUser({ username: 'Silva', password: 'spam123' });
            const task = await tasksService.createTask({ title: 'Baz', description: 'Lorem' }, user1);

            await tasksService.deleteTaskById(task.id, user2);

            expect(await taskRepository.find({ id: task.id })).toHaveLength(1);
        });
    });

    describe('ModifyTask', () => {
        it('Changes task status', async () => {
            const user = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            const task = await tasksService.createTask({ title: 'Baz', description: 'Lorem' }, user);

            const returnedTask = await tasksService.modifyTask(task.id, TaskStatus.IN_PROGRESS, user);

            expect(returnedTask.id).toEqual(task.id);
            expect(await taskRepository.findOne({ id: task.id })).toEqual(expect.objectContaining({
                status: TaskStatus.IN_PROGRESS,
            }));
        });

        it('Does not modify task that does not belog to user', async () => {
            const user1 = await authService.signUpUser({ username: 'Matos', password: 'spam123' });
            const user2 = await authService.signUpUser({ username: 'Silva', password: 'spam123' });
            const task = await tasksService.createTask({ title: 'Baz', description: 'Lorem' }, user2);

            const returnedTask = await tasksService.modifyTask(task.id, TaskStatus.IN_PROGRESS, user1);

            expect(returnedTask).toBeFalsy();
            expect((await taskRepository.findOne({ id: task.id })).status).not.toEqual(TaskStatus.IN_PROGRESS);
        });
    });
});
