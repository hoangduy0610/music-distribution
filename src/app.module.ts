import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/AuthModule';
import { UserModule } from './modules/UserModule';
import { ConfigModule } from '@nestjs/config';
import { ReleaseModule } from './modules/ReleaseModule';
import { TrackModule } from './modules/TrackModule';
import { LableModule } from './modules/LableModule';

require('dotenv').config();

@Module({
    imports: [
        //File môi trường: dev-local    test-server test    prod-production
        ConfigModule.forRoot({
            envFilePath: ['.env.dev', '.env.test', '.env.prod'],
            isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.DATABASE_HOST, {
            useNewUrlParser: true,
            useCreateIndex: true
        }),
        AuthModule,
        UserModule,
        ReleaseModule,
        TrackModule,
        LableModule
    ],
})
export class AppModule {
}
