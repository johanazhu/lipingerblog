
const path = require('path');
const fs = require('fs')
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger')
const session = require('koa-generic-session');
const redisStore = require('koa-redis');
const render = require('koa-art-template');
const static = require('koa-static');
const onerror = require('koa-onerror');
const morgan = require('koa-morgan')

const routing = require('./router');
const { REDIS_CONF, SECRETS } = require('./conf');


const app = new Koa();

// error handler
onerror(app)

app.keys = [SECRETS]
app.use(session({
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  store: redisStore({
    all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
  })
}))

// 静态资源目录对于相对入口文件index.js的路径
const staticPath = './static'

// 加载静态资源
app.use(static(
  path.join(__dirname, staticPath)
))


app.use(bodyParser())

app.use(logger())

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

const ENV = process.env.NODE_ENV
// if (ENV !== 'production') {
//   // 开发环境 / 测试环境
//   app.use(morgan('dev'));
// } else {
//   // 线上环境
//   const logFileName = path.join(__dirname, 'logs', 'access.log')
//   const writeStream = fs.createWriteStream(logFileName, {
//     flags: 'a'
//   })
//   app.use(morgan('combined', {
//     stream: writeStream
//   }));
// }
// const logFileName = path.join(__dirname, 'logs', 'access.log')
// const writeStream = fs.createWriteStream(logFileName, {
//   flags: 'a'
// })
// app.use(morgan('combined', {
//   stream: writeStream
// }));

render(app, {
  root: path.join(__dirname, 'views'),
  extname: '.art',
  debug: ENV !== 'production'
});


routing(app);

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

app.listen(8002, () => {
  console.log('listening at 8002 端口')
})