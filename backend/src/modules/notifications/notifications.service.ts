import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  constructor(@InjectQueue('notifications') private notificationQueue: Queue) {}


  async pushNotification(jobData: any) {
    await this.notificationQueue.add('send-notification', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    });
  }
}
