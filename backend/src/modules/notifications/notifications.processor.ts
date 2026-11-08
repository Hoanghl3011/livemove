import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationStatus } from '../../database/entities/notification.entity';

@Processor('notifications')
export class NotificationsProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<any> {
    const { orderId, recipientId, recipientType, title, body, payload, channel } = job.data;


    const notification = this.notificationsRepository.create({
      orderId,
      recipientId,
      recipientType,
      title,
      body,
      payload,
      channel,
      status: NotificationStatus.PENDING,
    });

    try {
      // TODO: Call FCM Service or Socket emit here
      console.log(`Sending notification: ${title} - ${body}`);
      
      notification.status = NotificationStatus.SENT;
      notification.sentAt = new Date();
    } catch (error) {
      notification.status = NotificationStatus.FAILED;
      notification.errorMessage = error.message;
    }

    await this.notificationsRepository.save(notification);
  }
}
