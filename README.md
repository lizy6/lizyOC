# OCProject
前端开发规范集

## 目录
1. [Yeoman+Angular+Gulp基础配置](https://github.com/lishan/OCProject/tree/master/Basic)
2. [Git使用](https://github.com/lishan/OCProject/tree/master/Git)
3. [sequelize使用]
4. [jupyter 开发环境配置]
    （1）安装用户科学计算的Anaconda安装包，软件下载可以在清华镜像： https://mirrors.tuna.tsinghua.edu.cn/anaconda/archive/
        不同操作系统请选择适配的安装文件，请选择支持python2的按照包：Anaconda2*
    （2）在命令行下执行jupyter notebook  --generate-config，默认在用户目录下生成.jupyter/jupyter_notebook_config.py
     (3) 打开jupyter_notebook_config.py文件，修改48行为：c.NotebookApp.allow_origin = '*'
        ## The IP address the notebook server will listen on.
        c.NotebookApp.ip = '127.0.0.1'
        ## Supply overrides for the tornado.web.Application that the Jupyter notebook
        #  uses.
        c.NotebookApp.tornado_settings = { 'headers': {'Content-Security-Policy': "child-src * "}}
        
    （4）在命令行下执行：jupyter notebook，记住日志中生成的URL及token：http://localhost:8888/?token=0c7b170fd6c4751d04f44ef60329f4312e8f0a4b45e597a6
    （5）在OCAI目录下的server/config.js 中修改：
                notebookUrl: 'http://127.0.0.1:8888/', // specify Notebook host
                token:'56d721a9ae536e5a592868d1dac3e6129e332f158a2e44b8',
                mariadb:'mariadb://ocai:Ocai@1234@10.1.236.82:3306/ocai',
                appPath:'notebookApp', // create folder to save Application projects in project root dir /Basic/'new_appPath_dir'
                modelPath:'notebookModel' // create folder to save Application projects in project root dir /Basic/'new_modelPath_dir'
    Run Jupyter Notebook in root project dir /Basic/ 

5.  [mysql配置]
     mysql数据库安装在10.1.236.82上，连接串为：mariadb://ocai:Ocai@1234@10.1.236.82:3306/ocai
     需要在server/config.js修改：mariadb:"mariadb://ocai:Ocai@1234@10.1.236.82:3306/ocai"