import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [HttpModule,ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),

  }),
  ScheduleModule.forRoot()


],
  controllers: [AppController],
  providers: [AppService,],
})
export class AppModule {}
