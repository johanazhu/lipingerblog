# 李瓶儿搭建博客



## 第一步：下载Koa

```shell
npm install koa --save
```

## 第二步：启动 koa 服务器

```javascript
const Koa = require('koa');

const app = new Koa();

app.use(async (ctx) => {
  ctx.body = 'Hello, world'
})

app.listen(3000, () => {
  console.log('listening at 3000 端口')
})
```

## 第三步：添加 koa-router 配置路由

koa很小，它与express 的区别在于，express集成了router，body解析等

但是 koa 很小，它拥有中间件机制，还有use的用法。其他的都不用，use的本质也是个中间件

koa-router 是专门管理路由的，他也是个中间件

```javascript

const Koa = require('koa');
+const Router = require('koa-router');

+const app = new Koa();
+const router = new Router()

+router.get('/api', (ctx) => {
+  ctx.body = 'api'
+})
// 使用中间件
+app.use(router.routes())

app.listen(3000, () => {
  console.log('listening at 3000 端口')
})
```

app.use 的用法，

app.use(functionA, functionB, functionC...)

app.use 中调用的都属于中间件。当然他也可以链式调用，例如

app.use(functionA).use(functionB)

koa-router中默认支持GET,POST请求，加上 allowedMethods 方法后，就能支持更多的请求，因为项目会使用Restful进行开发，所以此时先加上。

```javascript
...
// 使用中间件
+app.use(router.routes(), router.allowedMethods())
// 或者 app.use(router.routes()).use(router.allowedMethods())

app.listen(3000, () => {
  console.log('listening at 3000 端口')
})
```

记住，**koa中use中的函数都为中间件**

## 第四步：按照需求对router进行 目录改造

在根目录下建立 router 文件夹，在 router 文件夹中建立 articles.js(文章接口)，categories.js(类目接口)，comments.js(评论接口)，home.js(首页接口)，index.js，tags(标签接口)，users(用户接口)

以用户接口为例，

```javascript
const Router = require('koa-router');

const router = new Router();

router.prefix('/users')

router.get('/', (ctx) => {
  ctx.body = '寻找某个用户'
})

router.post('/',  (ctx) => {
  ctx.body = '注册'
} )
module.exports = router;
```

每个文件及路由。再在index.js中做统一的路由注册

```javascript
const userRouter = require('./users');
...

module.exports = app => {
	app.use(userRouter.routes()).use(userRouter.allowedMethods())
	...
};

```

但是文件一多就不好管理，这时，我们想到了nodejs中的fs模块，即文件模块，利用它，读取同目录下的文件，并逐一注册。代码如下：

```javascript
const fs = require('fs');

module.exports = (app) => {
  fs.readdirSync(__dirname).forEach(file => {
    if(file === 'index.js') return
    const route = require(`./${file}`)
    app.use(route.routes()).use(route.allowedMethods())
  })
}
```

## 第五步：请求数据的获取

我们知道当我们GET请求时，是在url后的 `?` 后加参数，形式问key=value。

前端如果传 `http://localhost:3000?name=张三&age=25` ，在koa2中怎么样才能拿到呢？

答案是：`ctx.query` 或者是 `cxt.request.query`

```javascript
app.use( async ( ctx ) => {
  let url = ctx.url
  // 从上下文的request对象中获取
  let request = ctx.request
  let req_query = request.query
  let req_querystring = request.querystring

  // 从上下文中直接获取
  let ctx_query = ctx.query
  let ctx_querystring = ctx.querystring

  ctx.body = {
    url,
    req_query,
    req_querystring,
    ctx_query,
    ctx_querystring
  }
})
```

那 post 请求如何获取呢？虽然可以用手写的方式实现，但并非本次教程的初衷。有兴趣的同学可以前往google 查询。

使用 koa-bodyparser 对请求体进行解析

```javascript
...
+const bodyParser = require('koa-bodyparser');

const routing = require('./router');
const app = new Koa();

+app.use(bodyParser())
```

从 ctx.request.body 中获取请求体；

![koa-bodyparser](https://i.loli.net/2021/07/07/IUkj3MeZBsO7AGf.png)

```javascript
router.post('/login', (ctx) => {
  const result = ctx.request.body;
  ctx.body = result
})
```

![koa-bodyparser2](https://i.loli.net/2021/07/07/tiSLhC5OczKvyPB.png)

## 第六步：试写各种接口

users.js

```javascript
...
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

router.post('/login', (ctx) => {
  ctx.body = '用户注册'
})
...
```

articles.js

```javascript
router.get('/', ctx => {
  ctx.body = '获取文章列表'
})

router.post('/', ctx => {
  ctx.body = '新建文章'
})

router.get('/:id', ctx => {
  ctx.body = '某篇文章详情'
})

router.patch('/:id', ctx => {
  ctx.body = '更新文章'
})

router.delete('/:id', ctx => {
  ctx.body = "删除文章"
})
```

先写这两个主要的路由接口，如果此两个主要路由通，其他都可在后续添加

## 第七步：加上mysql数据库

首先，mysql 是一种最常见的数据库，其次，对 mysql 感兴趣的可以移步XX

先下载 mysql 的包

```shell
npm i mysql --save
```

再下载 cross-env 包 来控制各个操作系统上的环境变量

```javascript
npm i cross-env --save
```

修改 package.json 中的 script 脚本

```javascript
    ...
    "dev": "cross-env NODE_ENV=dev nodemon app.js"
    ...
```

在根目录下创建，conf 文件夹和 db 文件夹，conf 文件夹用来存放各种配置。db 文件夹用来启动 mysql

先进入 conf 文件夹，创建 index.js

```javascript
const env = process.env.NODE_ENV // 环境变量

let MYSQL_CONF;

if(env === 'dev') {
  MYSQL_CONF = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    port: '3306',
    database: 'lipingerblog'
  }
}

module.exports = {
  MYSQL_CONF
}
```

进入 db 文件夹，创建index.js

```javascript

const mysql = require('mysql')
const { MYSQL_CONF } = require('../conf')

const con = mysql.createConnection(MYSQL_CONF)

con.connect();

function exec(sql) {
  const promise = new Promise((resolve, reject) => {
    con.query(sql, (err, result) => {
      if(err) {
        reject(err)
        return
      }
      resolve(result)
    })
  })
  return promise
}

module.exports = {
  exec
}
```

## 第八步：使用 workbench 初始化 数据库

如果使用 mysql 呢

这里需要说明一下，MongoDB 是对象数据库 ，而 mysql 是关系数据库，

如果使用 MongoDB，你可以直接在项目中创建你所需要的数据，比如id，username，password等数据字段

而用mysql的话你最好会使用mysql的语法，先创建数据库，在创建表，麻烦的要死。

为说明问题，本人大公无私，身先士卒，敢为人先

- 下载mysql
- 下载 Mysql Workbench 图形化工具
- 使用 Workbench 连接本地数据库

![使用workbench](https://i.loli.net/2021/07/07/GjpVx8hlOFnuv6K.png)



- 创建users表

![使用workbench1](https://i.loli.net/2021/07/07/ysRGozjYw7JX6b9.png)



- 创建articles表


![使用workbench2](https://i.loli.net/2021/07/07/6cakD8BWSQNUHif.png)

- 增删改查


在sql文本中，输入 use lipingerblog，使用lipingerblog这个数据库，show tables为显示所有的表

```mysql
use lipingerblog;

show tables
```

**增**

```mysql
insert into users(username, `password`, realname) values('zhangsan', '123', '张三')
```

ps：如果此时出现1366错误，说明realname的编码格式错误，将其改为utf-8 即可

**查**

查users表所有信息

```mysql
select * from users;
```

查users表中其中id和username的信息

```mysql
select id, username from users;
```

查符合条件的项 where

```mysql
select * from users where username='zhangsan'
```

查符合条件的项多个条件 `and` 和 `or`

```mysql
select * from users where username='zhangsan' and realname='张三'
```

模糊查询 `like`

```mysql
select * from users where username like '%zhang%'
```

查 排序 `order by id` 默认正序，如果倒序 在id后加 desc `order by id desc`

```mysql
select * from users where username like '%zhang%' order by id desc;
```

ps：一般不用 * ，耗性能

##### 改

更新 id为3的realname为张三

```mysql
update users set realname='张三1' where id='3'
```

**删**

```mysql
delete from users where realname='李四'
```

但一般来说不用delete，二是在users表中加一个状态，通过状态来判断他是否被删除。这种技术又称软删除

不是用删，而是用update更新他的状态

```mysql
update users set state='0' where username='lisi'
```

> PS：如果你的更新和删除出现 error：1175处于安全模式，先使用以下代码解除安全模式
>

```mysql
SET SQL_SAFE_UPDATES=0;
```

同理，将articles的数据也一并倒腾好

此时，我们的workbench 教程告一段落

## 第九步：koa连接mysql

首先，改造articles文件，

```javascript
const {exec} = require('../db');
const router = new Router();

router.prefix('/api/articles');

router.get('/', async (ctx) => {
  let sql = `select * from articles`;
  ctx.body = await exec(sql);
})
...
```

发现能拉取数据，说明koa已经和mysql已经连接了

## 第十步：控制和路由分而治之

目前的项目还比较简单，但是一旦开展起来，路由和控制应该要分开。以前叫MVC，model层，view层，controller层，但是因为此项目中没有model层和view层。但是router只管路由，也可以分层。所以在根目录下创建controller文件夹，在其目录下创建`articles.js` 和 `users.js`  ,改造第一个文件

```javascript
// controller/articles.js 
const { exec } = require('../db');

class ArticleCtl {
  async find(ctx) {
    let sql = `select * from articles`;
    ctx.body = await exec(sql);
  }
}

module.exports = new ArticleCtl()
```

```javascript
...
const { find } = require('../controller/articles');

const router = new Router();

router.prefix('/api/articles');

router.get('/', find)
...
```

跑起来后，目录结构清晰，为人大方，亲密可嘉

> ps：一般商业项目都有十几，二十几个接口，所以一般都是要分离的。虽然文件变多了，但是目录看起来清晰
>

## 第十一步：陆续做完剩下的路由和 mysql 连接

在做的过程中你会发现，有些地方需要登录才能操作，比如说你的更新自己的文章，你要删除自己的文章，那你是谁，你是否登录，一些列问题就出来了，这个时候我们不急，先用假数据把接口调通，下一步再实现登录认证。

```javascript
class ArticleCtl {
   // 查找所有文章
  async find(ctx) {
    let author = ctx.query.author || '';
    const keyword = ctx.query.keyword || '';

    let sql = `select * from articles where 1=1 `;
    if (author) {
      sql += `and author='${author}' `
    }
    if (keyword) {
      sql += `and title like '%${keyword}%' `
    }
    sql += `order by createtime desc;`
    ctx.body = await await exec(sql)
  }
  // 查找某一篇文章
  async findById(ctx) {
    const sql = `select * from articles where id='${ctx.params.id}'`
    const rows = await exec(sql);
    ctx.body = rows[0]
  }
  ...
 }
```

```javascript
const Router = require('koa-router');

+const { find, findById, create, update, delete: del} = require('../controller/articles');

const router = new Router();

router.prefix('/api/articles');

router.get('/', find)

router.post('/', create)

+router.get('/:id', findById)

+router.patch('/:id', update)

+router.delete('/:id', del)

module.exports = router;
```

这里需要注意的是，因为我们使用的是restful Api，所以 像 `router.get('/:id', findById) `  需要取值的时候是用ctx.params 来取，而不是ctx.query

创建文章，更新文章，删除文章均需要用户登录，所以这边用假数据代替

```javascript
  async create(ctx) {
    const { title = '', content = '' } = ctx.request.body;
    const createtime = Date.now()
    const author = 'zhangsan'
    const sql = `
      insert into articles (title, content, createtime, author)
      values ('${title}', '${content}', ${createtime}, '${author}')
    `
    const result = await exec(sql)

    ctx.body = {
      id: result.insertId
    }
  }

  async update(ctx) {
    const { title = '', content = '' } = ctx.request.body
    const id = ctx.params.id

    const sql = `
      update articles set title='${title}', content='${content}' where id=${id}
    `

    const resultData = await exec(sql)
    if (resultData.affectedRows > 0) {
      ctx.body = '更新成功'
    } else {
      ctx.body = '更新失败'
    }
  }

  async delete(ctx) {
    const id = ctx.params.id;
    const author = 'zhangsan';
    const sql = `delete from articles where id='${id}' and author='${author}'`

    const resultData = await exec(sql)
    if (resultData.affectedRows > 0) {
      ctx.status = 204
    } else {
      ctx.body = '删除博客失败'
    }
  }
```

关于delete方法中的sql语句，想了想，因为我的blog比较小众，也不存在删人账号这一说法，干脆用来学习一下sql语句也好。

以上为 articles.js 中的方法，再在controller中创建 users.js，这里写关于用户的相关操作

```javascript
const { exec } = require('../db');

class UsersCtl {
  async create(ctx) {
    
    const { username = '', password = '' } = ctx.request.body;

    const sql = `
      select username, realname from users where username='${username}' and password='${password}'
    `
    const resultData = await exec(sql);
    if(resultData[0]) {
      ctx.body = '登录成功'
      return
    }
    ctx.body = '登录失败'
  }
}

module.exports = new UsersCtl()
```

目前来说就只有登录这一接口

```javascript
const { create } = require('../controller/users');
router.post('/login', create)
```

## 第十二步：  cookie session

我不知道该怎么说明cookie 和 session

cookie其实就是在客户端发送http请求时，header中带有的某个key，传到服务端后，服务端能查看你的cookie，根据你的值判断你的人（你是谁）。这样就实现了用户的认证登录功能。

但是这并不安全，cookie是明文传输，黑客可以伪造你的cookie作恶，所以有了session，session 即 server端的存储用户信息。因为是在服务端，黑客就不轻易拿到，所以一般用cookie+session的方式来做用户认证

欲三更：也就是说 cookie 是一个实际存在的东西， http 协议中定义在 header 中的字段，可以认为是 session 的一种后端无状态实现。

cookie中存放 userid，server 端对应 username

说白了也很简单，就是 cookie 能实现客户端和服务端的会话，但是不够安全，那就定义一个 值（或叫userid，或叫sid），你客户端传这个值来一一对应用户，就做到了安全和会话。虽然麻烦，但是往往如此。

具体过程：用户首次访问网页，客户端发送请求给服务端，服务端收到后，查看http头，如果没有cookie，就用session做一个cookie来，然后返回cookie（cookie不仅可以在客户端设置，也可以在服务端设置），当用户第二次请求网页的时候，因为有cookie，服务器判断http头有cookie，就做出有cookie的展示...

http 本身是无状态的，session 是一种机制

session 从字面上讲，就是会话，cookie是浏览器本身自带的存储方式

例如：你请求我的登录页面，我用session 把你的信息存下来，如果你再请求我的其他页面，因为我的状态已经被session 存下来了，所以访问其他页面时，我们能请求到，如果session过期，那么我们会报错

> PS：也是心血来潮才做koa+session会话实现的。session更适合 页面渲染的后端，即前后端不分离的项目，现在的项目一般都是前后端分离，用jwt才是正解。我在express项目中正是用到了jwt。
>

## 第十三步：koa+session+cookie

了解完cookie和session是什么后，那怎么把session和koa结合呢？

当然是自己下个npm包啦，理论上我们应该下载koa-session，但是人生总是这样，koa-session 不能和 koa-redis结合（起码我是没看出来，如果有错误请指正），所以我们使用koa-generic-session包， 和koa-redis做结合

不排斥使用koa-session 和 redis的结合，如果能手写那是更厉害的，但是本文的核心是介绍一篇通俗易懂的koa2博客项目，所以为了从大流，选择koa-generic-session与koa-redis的结合

先来看看redis吧

## 第十四步：redis的基本用法

redis是内存数据库，一句话描述就是速度快，比起mysql等数据库，它因为存在内存中，所以速度快，一般网站都是用session和redis的结合，详见 redis 篇章

#### 常见的redis操作

| 命令          | 解释          | 例子             |
| ------------- | ------------- | ---------------- |
| set key value | 设置key       | set myname johan |
| get key       | 得到key       | get myname       |
| del key       | 删除key       | del myname       |
| keys *        | 显示所有的key | keys *           |

## 第十五步：koa链接session与redis

下载 `koa-generic-session` 和 `koa-redis` 包

在app.js 文件中配置redis和session 的配置

app.js

```javascript
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
+const session = require('koa-generic-session');
+const redisStore = require('koa-redis');

const routing = require('./router');
+const { REDIS_CONF, SECRETS } = require('./conf');
 

const app = new Koa();

app.keys = [ SECRETS ]
+app.use(session({
+  cookie: {
+    path: '/',
+    httpOnly: true,
+    maxAge: 24 * 60 * 60 * 1000
+  },
+  store: redisStore({
+    all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
+  })
+}))
...

```

controller/users.js

```javascript
const resultData = await exec(sql);
if (resultData[0].username) {
+    ctx.session.username = resultData[0].username;
+    ctx.session.realname = resultData[0].realname;
    ctx.body = '登录成功'
    return;
}
ctx.body = '登录失败'
```

让我们捋一下思路，当用户登录时，去数据库查数据，如果没有，就显示登录失败；如果有，那么保存下他的username和realname已经返回“登录成功”。

因为session保存的时间是24小时，所以在这24小时内，session 会话一直保持着（存在redis中）

## 第十六步：编写前端页面

我们已经把redis和session 都做好了，但是还不能检测出来，因为你必须要登录。所以我们需要先写前端页面。这里需要一些时间来找找模板，因为一个人的审美是很重要滴

筛选一番后，看重 [bootstrap 官网](https://themes.getbootstrap.com/)中的中模板，因为我们此番目的是教学，所以简约美是我们的方向。下载首页（home）以及文章列表页（post），将其中的代码拷贝至项目static文件下，如下所需的文件。而我们的模板使用的 art-template。

![资源文件](https://i.loli.net/2021/07/07/s1vTDqgEFCdny4X.png)

因为过于简单，在这里贴出[官网](https://koajs.com/) 链接，供大家查看，除此之外，还需要让服务加载静态资源，这里使用的是koa-static。

修改app.js

```javascript
...
+ const path = require('path');
+ const render = require('koa-art-template');
+ const static = require('koa-static')
...

// 静态资源目录对于相对入口文件index.js的路径
+const staticPath = './static'

// 加载静态资源
+app.use(static(
+  path.join(__dirname, staticPath)
+))

+app.use(bodyParser())

+render(app, {
+  root: path.join(__dirname, 'views'),
+  extname: '.art',
+  debug: process.env.NODE_ENV !== 'production'
+});

routing(app);
...
```

这样只是做好了一小步，首页和文章的样式都已经加载好了，但是我们还需要注册和登录的页面，下一节，动手做出注册登录页面

## 第十七步：错误处理

```typescript
import assert from 'assert';
import { KoaContext } from '../../types/koa';

/**
 * 全局异常捕获
 * 如果是通过 assert 主动抛出的异常, 则向客户端返回该异常消息
 * 如果是其它异常, 则打印异常信息, 并返回 Server Error
 */
export default function catchError() {
    return async (ctx: KoaContext, next: Function) => {
        try {
            await next();
        } catch (err) {
            if (err instanceof assert.AssertionError) {
                ctx.res = err.message;
                return;
            }
            ctx.res = `Server Error: ${err.message}`;
            console.error('Unhandled Error\n', err);
        }
    };
}

```



## 第十八步：部署

git push 到远程仓库

在服务器中配置后 git 私钥后，git pull 远程仓库代码





## 请我喝咖啡☕️

如果您觉得这个项目能够帮助到您，可以给我个 star🌟，也可以推荐给您的朋友

持续更新中～ 🚀🚀🚀

<img src="https://s2.loli.net/2022/10/09/31kvp8HRJuoBCfc.jpg" height="300px" width="300px" />

## License

MIT



