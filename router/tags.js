const Router = require('koa-router');

const router = new Router;

router.prefix('/api/tags')

router.get('/', ctx => {
  ctx.body = '获取标签列表'
})

module.exports = router;