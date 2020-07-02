const xss = require('xss');
const { exec } = require('../db');

class ArticleCtl {
  async find(author, keyword) {

    let sql = `select * from articles where 1=1 `;
    if (author) {
      sql += `and author='${author}' `
    }
    if (keyword) {
      sql += `and title like '%${keyword}%' `
    }
    sql += `order by createtime desc;`
    return await exec(sql)
  }


  async getDetail(id) {
    const sql = `select * from articles where id='${id}'`
    const rows = await exec(sql);
    return rows[0]
  }

  async newBlog(blogData = {}) {

    const title = xss(blogData.title);
    const content = xss(blogData.content);
    const author = blogData.author;

    const createtime = Date.now()

    const sql = `
      insert into articles (title, content, createtime, author)
      values ('${title}', '${content}', ${createtime}, '${author}')
    `
    const result = await exec(sql)

    return {
      id: result.insertId
    }
  }

  async updateBlog(id, blogData = {}) {

    const title = xss(blogData.title);
    const content = xss(blogData.content);

    const sql = `
      update articles set title='${title}', content='${content}' where id=${id}
    `

    const resultData = await exec(sql)
    if (resultData.affectedRows > 0) {
      return true
    } else {
      return false
    }
  }

  async delBlog(id, author) {

    const sql = `delete from articles where id='${id}' and author='${author}'`

    const resultData = await exec(sql)
    if (resultData.affectedRows > 0) {
      return true
    } else {
      return false
    }
  }
}

module.exports = new ArticleCtl()
