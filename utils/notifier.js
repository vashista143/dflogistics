const { Expo } = require("expo-server-sdk");
const User = require("../models/User");

// Initialize the Expo SDK client instance
const expo = new Expo();

const broadcastNewJobNotification = async (jobTitle, companyName) => {
  try {
    // 1. Fetch all users who have notifications turned ON and have a push token saved
    const users = await User.find({
      pushToken: { $exists: true, $ne: "" },
      notificationSettings: true, // Respects your Profile page switch toggle!
    }).select("pushToken");

    if (!users || users.length === 0) {
      console.log("No users found matching notification target requirements.");
      return;
    }

    let messages = [];
    for (let user of users) {
      // Validate that it's a legitimate token format before hitting Expo servers
      if (!Expo.isExpoPushToken(user.pushToken)) {
        console.error(`Token ${user.pushToken} is invalid.`);
        continue;
      }

      messages.push({
        to: user.pushToken,
        sound: "default",
        title: "🚀 New Job Posted!",
        body: `${jobTitle} at ${companyName}. Tap to view details and apply.`,
        data: { screen: "jobs" }, // Dynamic routing instruction payload passed to React Native
      });
    }

    // 2. Expo requires notifications to be sent in batches/chunks of 100 max
    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];

    for (let chunk of chunks) {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }
    
    console.log(`Successfully dispatched ${tickets.length} push notification payloads.`);
  } catch (error) {
    console.error("Broadcasting push notification failed:", error);
  }
};

module.exports = { broadcastNewJobNotification };