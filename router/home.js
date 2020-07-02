const Router = require('koa-router');
const { find } = require('../controller/articles');
const utils = require('../utils');

const router = new Router();

router.get('/home', async (ctx) => {
  const articles = await find(ctx);
  // for (var i = 0; i < articles.length; i++) {
  //   let target = articles[i];
  //   console.log('target', target)
  //   utils.formatTime(target.createtime)
  // }
  // console.log('articles', articles)
  ctx.render('home', {
    articles
  })
})

router.get('/post', async (ctx) => {
  ctx.render('post')
})

router.get('/login', async (ctx) => {
  ctx.render('login')
})
// 管理后台
router.get('/admin', async (ctx) => {
  ctx.render('admin')
})

// 新增文章
router.get('/new', async (ctx) => {
  ctx.render('new')
})

// 编辑文章
router.get('/edit', async (ctx) => {
  ctx.render('edit')
})

// 文章详情
router.get('/detail', async (ctx) => {
  ctx.render('detail')
})


// 首页
router.get('/', async (ctx) => {
  ctx.render('index')
})
module.exports = router;