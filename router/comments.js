const Router = require('koa-router');

const router = new Router();

router.prefix('/api/comments');

router.get('/', ctx => {
  ctx.body = '获取评论列表'
}) 
module.exports = router;