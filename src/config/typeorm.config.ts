import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

const dbConfig = process.env.NODE_ENV === 'test' ? {
    type: 'sqlite',
    database: ':memory:',
    synchronize: false,
} as SqliteConnectionOptions : {
    type: process.env.APP_DB_TYPE || 'postgres',
    host: process.env.APP_DB_HOST || 'localhost',
    port: parseInt(process.env.APP_DB_PORT, 10) || 5432,
    username: process.env.APP_DB_USER || 'postgres',
    password: process.env.APP_DB_PASS || '',
    database: process.env.APP_DB_NAME || 'taskmanagement',
    synchronize: false,
} as PostgresConnectionOptions;

export const typeOrmConfig: TypeOrmModuleOptions = {
    entities: [__dirname + '/../**/*.entity.{ts,js}'],
    ...dbConfig,
};
