
const env = process.env.NODE_ENV // 环境变量

let MYSQL_CONF,
  REDIS_CONF;

if (env === 'dev') {
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'lipingerblog'
  }
  REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
  }
  SECRETS = 'johan12_345*'
} else {
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'lipingerblog'
  }
  REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
  }
  SECRETS = 'johan12_345*'
}


// app.keys = [config.session.secrets]
// app.use(session({
//   key: 'jackblog.sid',
//   store: RedisStore({
//     host:config.redis.host,
//     port:config.redis.port,
//     auth_pass:config.redis.password || ''
//   }),
//   cookie: config.session.cookie
// }))
// session 配置
// app.keys = ['sdsnauf_76']
// app.use(session({
//   // 配置 cookie
//   cookie: {
//     path: '/',
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000
//   },
//   // 配置 redis
//   store: redisStore({
//     // all: '127.0.0.1:6379' // 先写死本地的 redis
//     all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
//   })
// }))

// if(env === 'dev') {
//   MYSQL_CONF = {
//     host: 'localhost',
//     user: 'root',
//     password: '123456',
//     port: '3306',
//     database: 'lipingerblog'
//   }
// }

module.exports = {
  MYSQL_CONF,
  REDIS_CONF,
  SECRETS
}