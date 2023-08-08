import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { promises as fsPromises } from 'fs';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AppService {

  constructor(private readonly httpService: HttpService) { }

  applications: Array<any> = [
    { appName: "Boookito-Backend", apiRoute: 'api.boookito.ir/api/v2/ping', logs: [] },
    { appName: "Boookito-Frontend", apiRoute: 'boookito.ir', logs: [] },
    { appName: "Boookito-Admin", apiRoute: 'admin.boookito.ir', logs: [] },
    { appName: "Tavangar-Backend", apiRoute: 'api.tavangar.ir/api/v1/getallproviders', logs: [] },
    { appName: "Tavangar-Frontend", apiRoute: 'tavangar.ir', logs: [] },

  ]


  getApplications() {
    return this.applications
  }


  async getRecentLogsByAppName(): Promise<any[]> {
    const sortedLogs: any[] = [];

    for (const application of this.applications) {
      const appName = application.appName;
      const fileContent = await fsPromises.readFile('./public/log.txt', 'utf-8');
      const logs = fileContent.split('\n').filter(Boolean);

      const appLogs = logs.filter((log) => log.includes(appName));
      const recentLogs = appLogs.slice(-90);
      


      const parsedLogs = recentLogs
        .map((log) => {
          const [timestamp, statusCode, message] = log.split(' - ');
          const isStatusCode200 = statusCode.trim() === 'Status Code: 200';
          return { timestamp, isStatusCode200 };
        })
        .sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateA.getTime() - dateB.getTime();
        })
        .map((log) => log.isStatusCode200);








      application.logs = parsedLogs;




      this.applications.forEach(element => {
        if (element.appName == appName) {
          element.logs = application.logs
          element.emptyRenderFields = 90 - application.logs.length


          const trueCount: number = element.logs.filter((item) => item === true).length; // تعداد بارهایی که مقدار true را دارند
          const uptimePercentage: number = (trueCount / application.logs.length) * 100;


          element.originLogsLength = uptimePercentage.toFixed(2)

        }

      });
      


    }



    return this.applications;
  }


  private counter=0;
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleCron() {
    this.counter+=1;
    console.log(this.counter)
    await this.getStatusApp()
  }


  async getStatusApp(): Promise<any> {
    for await (const iterator of this.applications) {
      try {

        const x = await this.httpService.get(`https://${iterator.apiRoute}`).toPromise()
        const statusCode = (await x).status;
        const timestamp = await new Date().toISOString();
        const log = `${timestamp} - Status Code: ${statusCode} - ${iterator.appName} - ${iterator.apiRoute}\n`;
        await fsPromises.appendFile('./public/log.txt', log);


      } catch (error) {

        const timestamp = await new Date().toISOString();
        const log = `${timestamp} - Status Code: 503 - ${iterator.appName} - ${iterator.apiRoute}\n`;
        await fsPromises.appendFile('./public/log.txt', log);
      }



    }
  }


  

}
