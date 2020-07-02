const { exec, escape } = require('../db');
const { genPassword } = require('../utils/cryp');


class UsersCtl {
  async login(username, password) {

    // username = escape(username);

    // password = genPassword(password);
    // password = escape(password);

    const sql = `
      select username, realname from users where username='${username}' and password='${password}'
    `
    const resultData = await exec(sql);
    return resultData[0] || {}
  }

}

module.exports = new UsersCtl()