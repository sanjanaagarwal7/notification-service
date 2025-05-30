const amqp = require('amqplib');
const QUEUE_NAME = 'notification_queue';
require('dotenv').config();
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const publishToQueue = async (payload) => {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL);

        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME);

        const buffer = Buffer.from(JSON.stringify(payload));
        channel.sendToQueue(QUEUE_NAME, buffer);

        console.log('Notification sent to queue:', payload);
        setTimeout(() => connection.close(), 500);
    } catch (error) {
        console.error('Error while sending to queue:', error);
    }
};

module.exports = publishToQueue;
