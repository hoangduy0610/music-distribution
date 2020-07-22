import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as basicAuth from 'express-basic-auth';

require('dotenv').config();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use('/swagger-ui.html', basicAuth({
		challenge: true,
		users: { zyth: 'zyth_music@2020' },
	}));
	app.enableCors();
	const options = new DocumentBuilder()
		.setTitle('Phân phối âm thanh')
		.addBearerAuth()
		.setVersion('1.0')
		.setContact('Nguyễn Hoàng Duy', 'https://zyth.tk/', 'hoangduy06104@zyth.tk')
		.setDescription('Hệ thống phân phối âm nhạc cho mọi nhà');

	if (process.env.MODE === 'production') {
		options.addServer("https://");
	} else if (process.env.MODE === 'test') {
		options.addServer("http://");
	}

	const document = SwaggerModule.createDocument(app, options.build());
	SwaggerModule.setup('/swagger-ui.html', app, document);
	await app.listen(process.env.SWAGGER_PORT);
}

bootstrap();
