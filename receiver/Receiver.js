const amqp = require('amqplib');
require('dotenv').config({ path: __dirname + '/../.env' });


const QUEUE = 'notification_queue';
const RABBITMQ_URL = process.env.RABBITMQ_URL;
const consumeQueue = async () => {
    try {
        const conn = await amqp.connect(process.env.RABBITMQ_URL);

        const channel = await conn.createChannel();
        await channel.assertQueue(QUEUE);
        console.log('Waiting for notifications in queue...');

        channel.consume(QUEUE, (msg) => {
            const data = JSON.parse(msg.content.toString());

            let attempts = 0;
            const maxRetries = 3;

            function trySendNotification() {
                attempts++;

                try {
                    const randomFail = Math.random() < 0.35;
                    if (randomFail) {
                        throw new Error('Simulated failure');
                    }

                    console.log(`[${data.type}] Notification sent to ${data.user}: "${data.message}"`);
                    channel.ack(msg); 

                } catch (err) {
                    console.log(`Retry ${attempts} failed for ${data.user}: ${err.message}`);

                    if (attempts < maxRetries) {
                        // Retry after 1 second
                        setTimeout(trySendNotification, 1000);
                    } else {
                        console.error(`Notification to ${data.user} failed after ${maxRetries} attempts`);
                        channel.ack(msg); 
                    }
                }
            }

            trySendNotification();
        });

    } catch (err) {
        console.error('Error while consuming queue:', err);
    }
};

consumeQueue();
