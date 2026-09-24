import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'importify-app',
      timestamp: new Date().toISOString(),
    };
  }
}
