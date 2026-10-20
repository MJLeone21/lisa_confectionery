const Notification = require('../models/Notification');
const { catchAsync } = require('../middleware/error');

// GET /api/notifications — admin only, most recent first
exports.getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find().sort('-createdAt').limit(50);
  const unreadCount = await Notification.countDocuments({ read: false });
  res.status(200).json({ status: 'success', results: notifications.length, unreadCount, data: notifications });
});

// PATCH /api/notifications/mark-all-read — admin only
exports.markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.status(200).json({ status: 'success' });
});

// DELETE /api/notifications/:id — admin only
exports.deleteNotification = catchAsync(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: 'success', data: null });
});
