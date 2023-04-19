---
layout: post
title: AWS上EMR使用笔记
categories: 一个实习生
keywords: AWS EC2 EMR AWS EC2 and AWS EMR and AWS RDS
tags:  AWS 实习笔记
---
  
近些天来，一直使用AWS的相关产品，从最开始用EC2，后来到EMR，也遇到一些坑，整理下，作为记录。
最开始的aws配置就不讲了。 不会的话就 

* `aws help`
* `aws ec2 help`
* `aws emr ls help`


首先下面这段代码终端里肯定是不能跑的，我只是为了好看，才这样放的。而且不一定要从终端的方式，`python`可以用`boto3`, 其他编程语言也提供了相应的SDK，可以操作。


```bash
$ aws emr create-cluster 
 	 --applications Name=Ganglia Name=Spark Name=Zeppelin 
	 --ec2-attributes 
							'{
								"KeyName": "crawl-beijing",
								"InstanceProfile": "EMR_EC2_DefaultRole",
								"SubnetId": "subnet-61528516",
								"EmrManagedSlaveSecurityGroup":  "sg-ee6e828a",
								"EmrManagedMasterSecurityGroup": "sg-ed6e8289"
							}' 
	 --service-role EMR_DefaultRole 
	 --enable-debugging 
	 --release-label emr-5.2.0 
	 --log-uri 			's3n://aws-logs-243495284874-cn-north-1/elasticmapreduce/' 
	 --steps 
			 			'[
			 				{
								"Args": [
												"spark-submit", 
												"--deploy-mode", "cluster", 
												"--master", "yarn", 
												"--conf", "spark.yarn.submit.waitAppCompletion=false", 
												"--num-executors", "5", 
												"--executor-cores", "5", 
												"--executor-memory", "20g", "s3://zero2hadoop-jobs-mour/part1/wordcount.py", 
																			"s3://zero2hadoop-in-mour/part1/hello.txt", 
																			"s3://zero2hadoop-in-mour/part1/wordcount_spark.txt"
												],

								"Type": "CUSTOM_JAR",
								"ActionOnFailure": "CONTINUE",
								"Jar": "command-runner.jar",
								"Properties": "",
								"Name": "SparkWordCountApp"
							},
						
							{
								"Args": [
												"spark-submit", "s3://zero2hadoop-jobs-mour/part1/wordcount.py", 
																"s3://zero2hadoop-in-mour/part1/hello.txt", 
																"s3://zero2hadoop-in-mour/part1/wordcount_spark.txt"
												],

								"Type": "CUSTOM_JAR",
								"ActionOnFailure": "CONTINUE",
								"Jar": "command-runner.jar",
								"Properties": "",
								"Name": "SparkWordCountApp"
							}
						]' 
	 --name 	'My cluster' 
	 --instance-groups 
	 					'[
	 						{
								"InstanceCount": 1,
								"InstanceGroupType": "MASTER",
								"InstanceType": "m3.xlarge",
								"Name": "Master Instance Group"
							},
							{
								"InstanceCount": 1,
								"InstanceGroupType": "CORE",
								"InstanceType": "m3.xlarge",
								"Name": "Core Instance Group"
							}
						]' 

	 --configurations   '[
	 						{
	 							"Classification":"spark",
	 							"Properties":
	 									{"maximizeResourceAllocation":"true"},
	 							"Configurations":[]
	 						}
	 					]' 

	 --region cn-north-1

```

这基本是一份完整的配置，可以从命令行直接启动(去除里面的换行符)，现在只是为了有个全局观，然后来分析一下相关的知识。

最简单的我们可以看到，存储使用的是aws s3,那么ok,我们来看下s3的相关操作吧(当然一切的前提都是在你配置好`aws configure`之后,输入你的id, key,region之后)，配置好之后就可以操作ec2,emr所有的aws相关的产品。


```bash

$ aws s3 mb s3://mybuckets 			#create a s3 bucket
$ aws s3 ls
$ aws s3 cp --recursive /mylocal/path/ s3://s3uriname/yourdir  # just use for directories
$ aws s3 ls s3://mybucket					# also you can use ls --recursive

```

ok，s3创建完毕，我们看看最简单的选项 `--applications Name=Ganglia Name=Spark Name=Zeppelin` 当然其实很明显了，就是你创建的EMR里面需要包括什么组件，直接写到Name里面就行了(前提是aws有的才行)。
下面接着分析选项；

* `--service-role EMR_DefaultRole`  对应的Role有对应的安全组规则

*  EMR是在运行在EC2实例上的，所以可以看到下面对应的属性，需要设置EC2的相关信息。， 而`KeyName`则是代表了日后你ssh进去的时候后所需的pem文件名，例如我是crawl-beijing，那我就应该用`ssh -i ~/crawl-beijing.pem aws-ec2.publicip.com` ,当然`awscli`里面自带的也有ssh工具，`aws emr ssh --cluster-id j-3NJ4N3NZCMMT4 --key-pair-file ./crawl-beijing.pem`,cluster-id是通过`aws emr --listculsters`来查看的。

>  
```bash
	--ec2-attributes 
	                            '{
	                                "KeyName": "crawl-beijing",
	                                "InstanceProfile": "EMR_EC2_DefaultRole",
	                                "SubnetId": "subnet-61528516",
	                                "EmrManagedSlaveSecurityGroup":  "sg-ee6e828a",
	                                "EmrManagedMasterSecurityGroup": "sg-ed6e8289"
	                }'
```

* --steps 里面是可以设置相应的操作步骤，步骤完成之后，自动终止EMR集群，不过要加 `--auto-terminate`选项，这样的话就会在执行完成之后终止集群，并将相应的数据保存到之前设定的S3数据桶中。而在step中的操作，则要涉及到对应程序的使用了，例如我用spark跑一个wordcount,如果是pig程序，那就是类似这样的

```bash
	--steps Type=PIG,Name="Pig Program",ActionOnFailure=CONTINUE,
			Args=[
					-f,s3://mybucket/scripts/pigscript.pig,
					-p,INPUT=s3://mybucket/inputdata/,
					-p,OUTPUT=s3://mybucket/outputdata/,
					$INPUT=s3://mybucket/inputdata/,
					$OUTPUT=s3://mybucket/outputdata/]
```
如果我跑的是个python代码或者java代码，又有不同的方式，需要用`spark-submit`

```bash
	./bin/spark-submit \
		  --class <main-class> \
		  --master <master-url> \
		  --deploy-mode <deploy-mode> \
		  --conf <key>=<value> \
		  ... # other options
		  <application-jar> \
		  [application-arguments]
```
来提交，不过无论是哪种程序，都要顾及到代码本身的选项输入输出，然后写在`spark-submit`中，就像之前的这种

```bash
{
            "Args": [
                            "spark-submit", 
                            "--deploy-mode", "cluster", 
                            "--master", "yarn", 
                            "--conf", "spark.yarn.submit.waitAppCompletion=false", 
                            "--num-executors", "5", 
                            "--executor-cores", "5", 
                            "--executor-memory", "20g", "s3://zero2hadoop-jobs-mour/part1/wordcount.py", 
                                                        
                                                        "s3://zero2hadoop-in-mour/part1/wordcount_spark.txt"
                            ],

                                "Type": "CUSTOM_JAR",
                                "ActionOnFailure": "CONTINUE",
                                "Jar": "command-runner.jar",
                                "Properties": "",
                                "Name": "SparkWordCountApp"
                            }
```


* `--instance-groups` 很明显这是为了EMR做EC2初始化类型和数目的限定

```bash
[
        {
            "InstanceCount": 1,
            "InstanceGroupType": "MASTER",
            "InstanceType": "m3.xlarge",
            "Name": "Master Instance Group"
        },
        {
            "InstanceCount": 2,
            "InstanceGroupType": "CORE",
            "InstanceType": "m3.xlarge",
            "Name": "Core Instance Group"
        }
    ] 

```




让我们把他变得简单点，起码看着简单点。
我们可以把相应的配置参数放在文件中，然后通过`file://`来读取

```bash
$	aws emr create-cluster 
	 	 --applications Name=Ganglia Name=Spark Name=Zeppelin 
		 --ec2-attributes file://ec2-attributes.json 
		 --service-role EMR_DefaultRole 
		 --enable-debugging 
		 --release-label emr-5.2.0 
		 --log-uri 	's3n://aws-logs-243495284874-cn-north-1/elasticmapreduce/' 
		 --steps 	file://spark-submit-step.json 
		 --name 	'My cluster' 
		 --instance-groups file://spark-master-slave.json 
		 --configurations   '[
		 						{
		 							"Classification":"spark",
		 							"Properties":
		 									{"maximizeResourceAllocation":"true"},
		 							"Configurations":[]
		 						}
		 					]' 
		 --region cn-north-1

```

Other:
基本上就是这样，详细了解的话。AWS EMR的文档要看。相关还有hadoop和spark相关。

* windows/mac 下有个s3 brower程序可以用
* 应该在本地做好实验，然后再放在aws上跑
* 多使用help命令，然后阅读文档的时候，有pdf格式的，多语言里面选择中文，即可。
* 启动之后是不能直接访问的，需要手动配置对应安全组的出入站协议，不开相应端口(选择相应的协议)的话是不能访问的，当初用EMR的时候就是这样的，惨痛的教训，根本连接不到主节点。 
