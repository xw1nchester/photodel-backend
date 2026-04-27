import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class NotificationsService {
    constructor(private readonly dataSource: DataSource) {}

    async getNotificationsCount(userId: number) {
        const result = await this.dataSource.query(
            `
            SELECT
                (SELECT COUNT(*) FROM filming_requests WHERE receiver_user_id = $1 AND status = 'pending') AS "filmingCount",
                (SELECT COUNT(*) FROM training_requests WHERE receiver_user_id = $1 AND status = 'pending') AS "trainingCount",
                (SELECT COUNT(*) FROM team_requests WHERE receiver_user_id = $1 AND status = 'pending') AS "teamCount",
                (SELECT COUNT(*) 
                FROM chats_members cm
                JOIN chats c ON c.id = cm.chat_id
                WHERE cm.user_id = $1
                AND (cm.last_read_message_id IS NULL OR cm.last_read_message_id < c.latest_message_id)
                ) AS "unreadChatsCount"
            `,
            [userId]
        );

        return {
            filming: Number(result[0].filmingCount),
            training: Number(result[0].trainingCount),
            team: Number(result[0].teamCount),
            unreadChats: Number(result[0].unreadChatsCount),
            total:
                Number(result[0].filmingCount) +
                Number(result[0].trainingCount) +
                Number(result[0].teamCount) +
                Number(result[0].unreadChatsCount)
        };
    }
}
