const Model = require('../model');

module.exports = class Notification extends Model {
  constructor(data = {}) {
    super('notifications');

    this.data.id = data.id;
    this.data.user = data.user;
    this.data.create_date = data.create_date;
    this.data.type = data.type;
    this.data.seen = data.seen;
    this.data.notification_post = data.notification_post;
    this.data.notification_comment = data.notification_comment;
  }
  static table = 'notifications';
}

