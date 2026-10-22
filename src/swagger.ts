import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function buildSwaggerDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('KusiTrip API')
    .setDescription(
      'REST API for the KusiTrip iOS app — auth, home, destinations, activities, reviews, search, wishlist and bookings.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  return SwaggerModule.createDocument(app, config);
}
