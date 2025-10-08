const Notification = require('../../models/notification');

module.exports = {
  getAll: async (req, res) => {
    let { limit, offset } = req.query ? req.query:{};
    if ((typeof limit != 'undefined' && isNaN(limit)) || (typeof offset != 'undefined' && isNaN(offset))) {
      return res.status(400).json({
        status: false,
        error: 'Invalid query values'
      });
    }
    try {
      limit = typeof limit != 'undefined' ? Number.parseInt(limit):undefined;
      offset = typeof offset != 'undefined' ? Number.parseInt(offset):undefined;
      const result = await Notification.get_all({ value: req.user.id, param: 'user', order_by: 'create_date', asc: false, limit: limit, offset: offset });
      if (result == null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        return res.status(200).json({
          status: true,
          data: result.data,
          count: result.count
        });
      }
    } catch(err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  },

  getUnread: async (req, res) => {
    try {
      const result = await Notification.get_all({ value: [req.user.id, false], param: ['user', 'seen'] });
      if (result == null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        return res.status(200).json({
          status: true,
          data: result.count
        });
      }
    } catch(err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  },

  updateOne: async (req, res) => {
    if (isNaN(req.params.notification_id)) {
      return res.status(400).json({
        status: false,
        error: "Invalid notification ID value"
      });
    }
    try {
      const notification = new Notification();
      if (!(await notification.find(req.params.notification_id))) {
        return res.status(404).json({
          status: false,
          error: 'Notification is not found'
        });
      }
      if (notification.data.seen) {
        return res.status(400).json({
          status: false,
          error: 'Notification is already seen'
        });
      }
      notification.data.seen = true;
      const result = await notification.save();
      if (result == null) {
        return res.status(500).json({
          status: false,
          error: 'Internal server error'
        });
      } else {
        return res.status(201).json({
          status: true,
          data: result
        });
      }
    } catch(err) {
      console.error(err);
      return res.status(500).json({
        status: false,
        error: err
      });
    }
  }
};

