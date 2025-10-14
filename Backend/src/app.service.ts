import { Injectable } from '@nestjs/common';
// main logic connecting ths backend logic to services and DB
 //when we go on a certain url, and a specific service is called from the controller, perform the following things
@Injectable()
export class AppService {
  getHello(): string {
    return 'This is my first NestJS app';
  }
}
