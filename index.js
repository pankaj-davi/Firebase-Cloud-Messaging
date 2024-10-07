const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Initialize the Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json()); // Middleware to parse JSON

// Endpoint to send a push notification
app.post('/send-notification', async (req, res) => {
  const { deviceToken, title, body, imageUrl } = req.body;
  console.log(req.body, "req.body"); // Log the incoming payload

const message = {
  notification: {
    title: title,
    body: body,
    image: imageUrl,  // Image is fine in the notification
  },
  android: {
    notification: {
      sound: 'gooutsound',  // Android-specific sound setting
      channel_id: 'your-channel-id-01', // Must match the channel ID defined in MainActivity
    },
  },
  apns: {
    payload: {
      aps: {
        sound: 'gooutsound.mp3',  // iOS-specific sound setting
      },
    },
  },
  data: {
    imageUrl: imageUrl,  // Custom data
    title: title,
    body: body,
  },
  token: deviceToken,  // The token of the recipient device
};


  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    res.status(200).send({ success: true, response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).send({ success: false, error: error.message });
  }
});



// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
