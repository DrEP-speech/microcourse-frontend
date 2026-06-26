// utils/sendNotification.js
import Notification from '../models/Notification.js';
import { io } from '../server.js'; // if using Socket.IO

export const sendMilestoneNotification = async (userId, badgeName) => {
  const message = `🎉 Congrats! You've earned the "${badgeName}" badge!`;

  // Save to DB
  await Notification.create({
    user: userId,
    message,
    type: 'milestone',
    read: false,
  });

  // Emit real-time notification (if Socket.IO enabled)
  if (io) {
    io.to(userId.toString()).emit('notification', {
      message,
      badgeName,
      type: 'badge',
    });
  }
};
