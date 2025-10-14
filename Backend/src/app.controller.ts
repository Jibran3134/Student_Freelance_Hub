import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
//manages the http requests
//when we go on a certain url, following service should be called
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
