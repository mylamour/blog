---
layout: post
title: The Basic Use Of R
categories: 学习数据挖掘的路上
kerywords: R programing
tags: 知识回顾
---

##### 有天想爬下拉勾的数据看看。而恰恰又在阿里买了9块9一个月的服务器(其实不咋样，安装R的一个包时就死机了)，好像不爬下都对不起这个价格。朋友说先直接在网上搜搜看看有没有现成的，结果就看到了别人用R和rvest去抓拉勾的数据。而之前恰恰买过《R语言实用数据分析和可视化技术》，所以今天就重记录一下学的一些R的基本知识，也好缓解缓解天天背单词的蛋疼生活。

# 包的安装加载卸载
>  
    install.packages("rvest")           #安装
    require(rvest) 或 library(rvest)                    #加载,好像还有一个是用supremessage
    detach("package:rvest")           #卸载
    
    
# R语言基础

1. 基础之基础
>    
    * 基本的加减乘除，赋值可以用 <- ，或assign("s",55)    删除变量直接rm(变量名).     判断什么类型：     is.numeric(x)  is.logical(k)   
    *  日期  data <- as.Date("2016-03-03")  
    *  缺失数据用NA代替
    * 向量什么的可以直接加减乘除
    * 字符数据 t <- "data" 和 t <- factor("data")是不一样的 
2. 数据框
>
 ![dataframe](../image/R/Rdataframe.png)
 对于数据框可以通过
 >  
    * ncol(DF), nrow(DF),dim(DF)分别得到列数，行数，和行列数。
    *   names(DF)得到数据框的列名
    *    names(DF)[1] 得到第一个元素
    *   rownames(DF)查看指定数据框的行名字
    *   head(DF , n = 8) 显示前面多少行的DF，也可以用 tail
  ![dataframe2](../image/R/Rdataframe2.png)
> 
 列表框的每一列都是一个独立的向量，即每一列都有自己的类 

3. 列表
>
    * list(1,2,3,4)
    * list(DF,1:10)
    * (emptylist <- vector(mode = "list", length =4 ))      用vector创建一个具有一定长度的空列表

4. 矩阵和数组
> 
    * A <- matrix(1:10, nrow = 5)    
    * colname(A), dim(A), ncol(A), nrow(A)
    * B <- array(1:11, dim = c(2,3,2)
    
    
# 导入数据 （还可以直接读网络上的数据）

1. 导入CSV(Excel数据要转换成CSV才能导入)
>  url <- "test.csv"    
>   t <- read.table(file = url, header = TRUE, sep = "," )

2. 导入数据库
>      require(RODBC); 
>      db <- odbcConnect("mysql_data", uid="root", pwd="123"); 
>      sqlTables(channel #查看数据中的表    
>      data<-sqlFetch(channel,"kk")

3. 导入其他数据格式
> 
| R  | type| 
| --------| :----------:| ------:|
| read.spss | SPSS|
| read.dta   | Stata|
| read.ssd  | SAS   |
|read.octave|Octave|
|read.mtp| Minitab|
|read.systat|Systat|

# 抓取数据

1. XML
>   require(XML)
>   URL <- "http://baidu.com"
>   biubiu <- readHTMLTable(URL,which = 1, header = FALSE, stringsAsFactors = FALSE)

2. rvest
>   直接来看看这个吧
[rvest](http://www.reed.edu/data-at-reed/resources/R/rvest.html)
>       现在的t <- html(url)已经不用的,转变为 t <- read_html(url)
        主要的东西还是要看Demo和官网的doc




## 后记
>    *  想要获得一份好的数据，就要先学爬数据，然而数据的获取方式不止有爬虫，还有通过API来获取，甚至Excel自带的数据导入自网站用起来也不错
*  一份好的数据同样需要好的可视化技术才能看的出来
*  想起来《数据之美》里面讲的不要太盲目相信数据，这是对的，就像人类制作超高精度的仪器，超高精度的仪器去制作高精度的，高精度的去制作普通经度的。
*  数据对我，有很大的吸引力，很想从中一窥究竟。但是现在觉得更多的是通过数据训练出一个模型，然后再去分析。
*  刚才看了厉哥的《我听过最好的评价》，写的真是很厉害啊，对于我现在这个时常迷茫的人大有帮助，谢谢。
    
    
    
    
    
    
    





















    

    
