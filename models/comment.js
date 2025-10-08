const Model = require('../model');
const User = require('./user');
const Post = require('./post');
const Notification = require('./notification');
const pool = require('../db').promise();

module.exports = class Comment extends Model {
  constructor(data = {}) {
    super('comments');

    this.data.id = data.id;
    this.data.author = data.author;
    this.data.publish_date = data.publish_date;
    this.data.status = data.status;
    this.data.answer = data.answer;
    this.data.content = data.content;
    this.data.image = data.image;
    this.data.topic = data.topic;
    this.data.post = data.post;
    this.data.parent_comment = data.parent_comment;
  }
  static table = 'comments';

  async delete() {
    try {
      if (this.data.id && await this.find(this.data.id)) {
        await pool.query(`DELETE FROM \`notifications\` WHERE \`notification_comment\` = ?`, this.data.id);
        if (this.data.answer) {
          await new User({id: this.data.author}).change_rating(this.data.topic, -3);
          const parent_post = new Post();
          await parent_post.find(this.data.post);
          parent_post.data.status = 'active';
          await parent_post.save();
        }
        if (this.image
            && fs.existsSync(path.join(__dirname, '..', '..', 'public', 'images', this.image))) {
          fs.rmSync(path.join(__dirname, '..', '..', 'public', 'images', this.image));
        }
        return await super.delete();
      } else {
        return null;
      }
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }

  async save() {
    let newNotifications = false;
    try {
      if (!this.data.id
          || (await pool.query(`SELECT * FROM \`${this.table}\` WHERE \`id\` = ?`, this.data.id))[0].length == 0) {
        newNotifications = true;
      }
      let comment_parent = this.data.parent_comment ? new Comment():new Post();
      await comment_parent.find(this.data.parent_comment || this.data.post);
      this.data.topic = comment_parent.data.topic;
      if (this.data.parent_comment) {
        this.data.post = comment_parent.data.post;
      }
      let result = await super.save();
      if (result && newNotifications) {
        if (!this.data.parent_comment) {
          const followers = (await pool.query(`SELECT * FROM \`followings_posts\` WHERE \`post\` = ?`,
                                              comment_parent.data.id))[0]
                             .map(res => res.user);
          for (let i of followers) {
            await new Notification({
                                      user: i,
                                      type: 'following_comment',
                                      notification_comment: this.data.id
                                   }).save();
          }
        }
        await new Notification({
                                  user: comment_parent.data.author,
                                  type: 'new_comment',
                                  notification_comment: this.data.id
                               }).save();
      }
      return result;
    }
    catch (err) {
      console.error(err);
      return null;
    }
  }
}

