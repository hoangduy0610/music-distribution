import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/AuthModule';
import { ConfigModule } from '@nestjs/config';

require('dotenv').config();

@Module({
    imports: [
        //File môi trường: dev-local    test-server test    prod-production
        ConfigModule.forRoot({
            envFilePath: ['.env.dev', '.env.test','.env.prod'],
            isGlobal:true,
        }),
        MongooseModule.forRoot(process.env.DATABASE_HOST, {
            useNewUrlParser: true,
            useCreateIndex: true
        }),
        AuthModule,
    ],
})
export class AppModule {
}
