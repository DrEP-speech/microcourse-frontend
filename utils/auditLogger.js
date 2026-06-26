// utils/auditLogger.js
import AuditLog from '../models/AuditLog.js';

export const logAuditEvent = async ({
  userId,
  action,
  type = 'system',
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      user: userId,
      action,
      type,
      metadata,
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};
