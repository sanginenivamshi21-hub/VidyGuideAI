import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication<App>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.enableCors({
            origin: [
                'http://localhost:3000',
                'http://localhost:3001',
            ],
            credentials: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type, Accept, Authorization, Cookie, X-Requested-With',
            preflightContinue: false,
            optionsSuccessStatus: 204,
        });
        await app.init();
    });

    it('/ (GET)', () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect({
                status: 'ok',
                service: 'VidyGuideAI API',
            });
    });

    it('/auth/login (OPTIONS) - CORS preflight', () => {
        return request(app.getHttpServer())
            .options('/auth/login')
            .set('Origin', 'https://vidyguideai-web.onrender.com')
            .set('Access-Control-Request-Method', 'POST')
            .set('Access-Control-Request-Headers', 'Content-Type')
            .expect(204)
            .expect('Access-Control-Allow-Origin', 'https://vidyguideai-web.onrender.com')
            .expect('Access-Control-Allow-Credentials', 'true')
            .expect('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS')
            .expect('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, Cookie, X-Requested-With');
    });

    afterEach(async () => {
        await app.close();
    });
});
