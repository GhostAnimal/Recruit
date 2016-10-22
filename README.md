# Recruit
重写招新网站

##使用技术
后端语言：node.js

后台框架：express

模板引擎：ejs

数据库:mongodb

##网站使用指南
网站运行需要node环境，和mongodb数据库。

##一点问题
后台更新数据后，因为一些请求状态是304，所以更新后的数据要等一会儿才能刷新出来。

###启动数据库
在mongodb安装目录下创建一个文件夹保存数据，我创建的data/recruit；

在mongodb安装目录的bin目录下执行 ./mongod --dbpath ../data/recruit ,启动数据库。

###启动网站
在网站根目录下，执行 node app.js ,即可启动网站。

###后台管理URl
/admin

###管理员权限获取
需要先注册一个用户；

打开mongodb/bin目录下的 mongo.exe；

执行use recruit，使用网站的数据库；

执行db.users.find({}),找到所有用户，从中找出想设置为管理员的用户；

执行db.users.update({xxx：xxx(随便用一个键值对，找到想设置为管理员的用户)},{$set:{isAdmin:true}}),重新登录，即可进入后台管理页。
