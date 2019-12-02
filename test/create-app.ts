import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { INestApplication } from '@nestjs/common';

export default async (): Promise<[TestingModule, INestApplication]> => {
    const module = await Test.createTestingModule({
        imports: [
            AppModule,
        ],
    }).compile();

    const app = module.createNestApplication();
    await app.init();

    return [ module, app ];
};
