const Notification = require('../models/Notification');

/**
 * Fire-and-forget notification creator. Never throws into the caller —
 * a failed notification write shouldn't ever break the actual action
 * (login, order save, stock update, etc.) that triggered it.
 */
async function notify(type, message) {
  try {
    await Notification.create({ type, message });
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

module.exports = notify;
