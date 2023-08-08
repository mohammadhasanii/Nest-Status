import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Render } from '@nestjs/common';
import {PiGithubLogoThin} from 'react-icons/pi'


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}




  @Get()
  @Render('index')
  async root() {
   //const x= await this.appService.getStatusApp() //call send all request to applications
    //const applications=await this.appService.getApplications()
    const allLogs=await this.appService.getRecentLogsByAppName()
    return { message: 'Hello world!' ,allLogs,PiGithubLogoThin};
  }

}
