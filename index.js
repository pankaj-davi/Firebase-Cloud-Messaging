const express = require('express');
const admin = require('firebase-admin');
const serverless = require('serverless-http'); // Assuming you're using serverless-http

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();

// Middleware to parse JSON body
app.use(express.json());

// Health check endpoint
app.get('/health-check', (req, res) => {
  res.status(200).json({ success: true, message: 'Service is up and running' });
});

// Endpoint to send a push notification
app.post('/send-notification', async (req, res) => {
  const { deviceToken, title, body, imageUrl } = req.body;
  console.log(req.body, "req.body");

  const message = {
    notification: {
      title: title,
      body: body,
      imageUrl: imageUrl,
    },
    android: {
      notification: {
        sound: 'default',
        channel_id: 'your-channel-id-01',
        imageUrl: imageUrl,
        icon: 'ic_launcher_round',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
    data: {
      imageUrl: imageUrl,
      title: title,
      body: body,
    },
    token: deviceToken,
  };

  try {
    const response = await admin.messaging().send(message); // Firebase messaging
    console.log('Successfully sent message:', response);
    res.status(200).send({ success: true, response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});

// Export the handler for each function
module.exports.sendNotification = serverless(app); // Export the sendNotification function
module.exports.healthCheck = serverless(app); // Export the healthCheck function
