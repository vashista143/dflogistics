const admin = require("firebase-admin");
const User = require("../models/User");
const serviceAccount = require("../fir-rtc-e6811-firebase-adminsdk-fbsvc-c883570c91.json");

// Initialize Firebase App
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const broadcastNewJobNotification = async (jobTitle, companyName) => {
  try {
    // 1. Fetch all user push tokens from MongoDB
    const users = await User.find({ pushToken: { $ne: "" }, notificationSettings: true }).select("pushToken");
    if (users.length === 0) return;

    const registrationTokens = users.map(user => user.pushToken);

    // 2. Define the payload structure
    const message = {
      notification: {
        title: "🚀 New Job Posted!",
        body: `${jobTitle} at ${companyName}. Tap to view details.`,
      },
      data: {
        screen: "jobs" // Handled by React Native deep linking / routing
      },
      tokens: registrationTokens, // Firebase accepts arrays of tokens up to 500 at a time automatically!
    };

    // 3. Send via Firebase Cloud Messaging
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully broadcasted notifications to ${response.successCount} users.`);
  } catch (error) {
    console.error("Firebase broadcast error:", error);
  }
};

module.exports = { broadcastNewJobNotification };
