import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: '',
    database: 'taskmanagement',
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    synchronize: false, // recommended to be false in production
};
