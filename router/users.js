const Router = require('koa-router');

const { login } = require('../controller/users');
const { SuccessModel, ErrorModel } = require('../model/resModel')

const router = new Router();

router.prefix('/api/users')

router.get('/', (ctx) => {
  ctx.body = '用户列表'
})

router.get('/:id', ctx => {
  ctx.body = '寻找某个用户'
})

router.patch('/:id', ctx => {
  ctx.body = '更新某个用户'
})

router.delete('/:id', ctx => {
  ctx.body = '删除某个用户'
})


router.post('/login', async (ctx, next) => {

  const { username, password } = ctx.request.body;
  const data = await login(username, password);
  if (data.username) {
    ctx.session.username = data.username;
    ctx.session.realname = data.realname;

    ctx.body = new SuccessModel()
    return
  }
  ctx.body = new ErrorModel('登录失败')
})

module.exports = router;