import {NestFactory} from '@nestjs/core';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';
import {AppModule} from './app.module';
import * as basicAuth from 'express-basic-auth';

require('dotenv').config();

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.use('/swagger-ui.html', basicAuth({
		challenge: true,
		users: {tcheck: 'thomi_tcheck@2020'},
	}));
	app.enableCors();
	const options = new DocumentBuilder()
		.setTitle('Truy xuất nguồn gốc')
		.addBearerAuth()
		.setVersion('1.0');

	if (process.env.MODE === 'production'){
		options.addServer("https://");
	}else if(process.env.MODE === 'test'){
		options.addServer("http://");
	}

	const document = SwaggerModule.createDocument(app, options.build());
	SwaggerModule.setup('/swagger-ui.html', app, document);
		await app.listen(process.env.SWAGGER_PORT);
}

bootstrap();
