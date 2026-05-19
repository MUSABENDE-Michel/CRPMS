import ActivityLog from '../models/ActivityLog.js';

export const logActivity = async (adminId, action, entity, entityId, description) => {
  try {
    await ActivityLog.create({
      adminId,
      action,
      entity,
      entityId,
      description,
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export const getActivityLog = async (filters = {}, page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;
    const logs = await ActivityLog.find(filters)
      .populate('adminId', 'username')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ActivityLog.countDocuments(filters);
    
    return {
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};
