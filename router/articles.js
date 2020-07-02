const Router = require('koa-router');

const { find, getDetail, newBlog, updateBlog, delBlog } = require('../controller/articles');

const { SuccessModel, ErrorModel } = require('../model/resModel');

const loginCheck = require('../middleware/loginCheck');

const router = new Router();

router.prefix('/api/articles');

router.get('/', async (ctx, next) => {
    let author = ctx.query.author || '';
    const keyword = ctx.query.keyword || '';
    if (ctx.query.isadmin) {
        if (ctx.session.username === null) {
            console.error('is admin,but no login')
            ctx.body = new ErrorModel('未登录')
            return
        }
        // 强制查詢自己的博客
        author = ctx.session.username
    }
    const listData = await find(author, keyword)
    ctx.body = new SuccessModel(listData)
})

// router.post('/', create)

router.get('/detail', async (ctx, next) => {
    const data = await getDetail(ctx.query.id)
    ctx.body = new SuccessModel(data)
})

router.post('/new', loginCheck, async (ctx, next) => {
    const body = ctx.request.body;
    body.author = ctx.session.username;
    const data = await newBlog(body);
    ctx.body = new SuccessModel(data);
})

router.post('/update', loginCheck, async (ctx, next) => {
    const val = await updateBlog(ctx.query.id, ctx.request.body)
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('更新博客失败')
    }
})

router.post('/del', loginCheck, async (ctx, next) => {
    const author = ctx.session.username;
    const val = await delBlog(ctx.query.id, author);
    if (val) {
        ctx.body = new SuccessModel()
    } else {
        ctx.body = new ErrorModel('删除博客失败')
    }
})


// router.patch('/:id', update)

// router.delete('/:id', del)

module.exports = router;