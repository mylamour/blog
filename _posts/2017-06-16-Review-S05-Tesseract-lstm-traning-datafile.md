---
layout: post
title: OCR和用Tesseract训练chi_sim.traineddata
categories: HowTo
tags: 知识回顾 学习笔记
---

#### 前言:Tesseract
Tesseract 最新的版本4.0版本，新增了lstm训练方式。当时做毕设时经过一系列的其他挫折，刚好发现这个可以使用在嵌入式开发板上，因此去学习并使用了一下。

#### 正文 一: OCR简介
主要有两种方法

1. Segment-Based method
> * Template Matching for OCR
> * Over-Segmentation

2. Segmentation-Free OCR
> * Based On HMM
> * Sequence Learning Approach

具体参考 [这篇论文](https://kluedo.ub.uni-kl.de/files/4353/PhD_Thesis_Ul-Hasan.pdf)，我也是读了之后，才觉得更加清晰了。
总的来讲就是两种方法，传统基于图像分割的方式进行文本识别，基本是采用模板匹配的方式。通过解压图片训练出一些特征后经过一个分类器使其和已知的进行比较，计算之间的相似度，有多大概率。但是分割有时不容易控制间隔，会导致图像过分割，从而使识别出来的字符变形。例如，m和n还有d,在过分割的情况下就会导致d识别为c和l。详细的例子可以参考上面那篇论文论文。而基于自由分割的OCR识别则不关心输入的长度，虽然他依旧使用分割后的图片作为输入。然后得到输出作为识别后的结果。这种方式通常使用隐马尔科夫模型和循环卷积神经网络。标准的模式识别中通常采用近邻算法，决策树，贝叶斯分类作为训练方法。在后面几章里在浅显讲讲对这些基础算法的学习情况。

<font color="red">下面所有操作，假设你已经安装好了最新版本的Tesseract，并且`clone`了相应的`langdata`和`tessdata`，并且放置在同一目录下。</font>
使用百度云下载详情参考`http://iami.xyz/Review-S06-Baiduyun-download-Taolu/`

#### 正文 二: Tesseract的普通训练方式
想去ProcessON上下载原图的时候，才发现自己忘了账号是什么了...虽然当时只是作为临时存毕设的流程图用，但也是大意了。
![default_flow](../image/Tesseract/common_01.png)

这就是默认的训练的流程，具体的也已经在流程图绘制的比较详细了。同样下图是每一步对应的操作。相关代码我已经放在了`gist`上，可以自行查看，包括生成图片和普通的训练链接为`https://gist.github.com/mylamour/e4f116e64d690c366715f67fefc8357f`

![default_flow_code](../image/Tesseract/common_02.png)


<font color="red"> 注意事项 </font>

* 最后合并时要和之前训练好的文件放置在同一文件夹 
* 自己由字体生成训练图片去训练的话，图片像素不宜过大。否则训练的时候，耗时不仅久，而且会占大量内存。
* 普通训练只占用单核，所以非常慢。

#### 正文 三: tesseract的LSTM训练方式

![default_lstm](../image/Tesseract/default_lstm.png)

这张图是按照官网给出的vgslspecs的语法，并结合官方文档介绍，自己推测画出来的。可能有错误，需要大牛指正。下面这张图展示了LSTM的cell的变化，LSTM是RNN的一种，更详细的需要参考后面的附录。我只能做个简单的介绍放在上面，数学功底有限，不宜妄言。只有理解了之后，才能重新设计一个新的网络去使用。

* LSTM的训练方式也有两种，一种是从头开始，自己设计一个网络。一种是从现有的字库种提取出lstm模型，然后进行修改，重新训练，合并出新的字体。此处我们选用第二种。之所以没有选用第一种，是因为从scratch训练需要运行scrollView.jar包，而这个包运行时必须需要物理显示器，也就是`0`位置的，像vnc之类的都是`0:1`或者`0:2`之类的，是不可以的。而我的服务器不仅没有物理显示器，而且我的真个环境是在自己的`docker`里面运行的。出于一系列问题，只能选第二种。

![lstm](../image/Tesseract/lstm_01.gif)

下面介绍如何进行训练。首先你需要生成一个训练集和一个测试集，下面的部分截图来自我论文里。

* step 1: 生成训练集和测试集
```bash
$ tesstrain.sh --fonts_dir /usr/share/fonts/ch_2000/ --lang chi_sim --linedata_only   --noextract_font_properties --langdata_dir /home/langdata   --tessdata_dir ./tessdata --output_dir /home/lstmtest/400type/chitrain
$ tesstrain.sh --fonts_dir /usr/share/fonts/ch_2000/ --lang chi_sim --linedata_only   --noextract_font_properties --langdata_dir /home/langdata   --tessdata_dir ./tessdata --font-list "STXinwei" --output_dir /home/lstmtest/400type/chitrain
#从这里就可以很明细的看出，如果不指定特定的字体的话，就会直接生成整个字体文件下的所有字体。
```

*  step 2: 从已有的字库数据里提取模型
```bash
$ combine_tessdata -e \
		/usr/local/share/tessdata/chi_sim.traineddata \
		./chi_sim.lstm
```

* step 3: 从已有模型开始训练
```bash
$ lstmtraining -U ./chitrain/chi_sim.unicharset \
	  --script_dir ../langdata --debug_interval 0 \
	  --continue_from ./tranlayer/chi_sim.lstm \
	  --append_index 5 --net_spec '[Lfx256 O1c105]' \
	  --model_output ./ \
	  --train_listfile ./chitrain/chi_sim.training_files.txt\
	  --max_iterations 500000
#明显看出要比传统训练少了不少步骤(自己操作的步骤)，其实脚本帮你做了。其中根据vgslspec语法，你可以修改网络层。训练的时候，会自动保存许多不同错误率的lstm文件，然后留待下一步选择一个合并就行了。
```

* step 4: 评估你训练的模型
```bash
$ lstmeval --model ./trainlayer/_checkpoint --eval_listfile ./chitrain/chi_sim.training_files.txt  
$ lstmeval --model ./chi_sim.lstm --eval_listfile ./tesseract-ocr/chieval/chi_sim.training_files.txt
#从这里看出来，既可以使用checkpoint也可以使用现有的lstm模型去验证
```

* step 5: 合并新的字库
```bash
	combine_tessdata -o ./chi_sim.traineddata \
	  xxxx.lstm \
	  ./chitrain/chi_sim.lstm-number-dawg \
	  ./chitrain/chi_sim.lstm-punc-dawg \
	  ./chitrain/chi_sim.lstm-word-dawg
```

合并后的字库后将其移动到tesseract的默认字库文件夹，便可以使用其进行识别了。


<font color="red"> 注意事项 </font>

* 获取字体名称 ，可以通过 `fc-list :lang=zh` 来查找/usr/share/fonts/下面的字体,然后经过一些列`awk,sed`得到需要的字体名，将其添加到`tesseract/training/languange-specific.sh`里
* 更好的方式是使用 `text2image --fonts_dir /usr/share/fonts/ch_2000/ --list_available_fonts`，这样就可以直接列出所有该目录下的字体文件名，但是需要注意的是依旧有不存在的，结果并不是完全正确的。
* 在`languange-specific`中更改时一定要注意`"\`是不对的，应该是`" \`
* 生成训练数据时一旦有一个错误出现就不会输出到相应的文件夹，但是可以根据记录到`/tmp/tmp.`下找到临时生成的文件，如果你不想或者不需要那么多，可以直接拷贝这些文件即可。但是这些文件时不完整的，所以你必须删除这些不存在的字体，使用`tesstrain.sh --fonts_dir /usr/share/fonts/ch_2000/ --lang chi_sim --linedata_only   --noextract_font_properties --langdata_dir /home/langdata --output_dir /home/lstmtest/400type/chitrain | grep "ERROR"
`找到Error的字体，多运行几次删除干净即可。注意我这句没有指定`tessdata_dir`,是因为我把他放在了系统变量。你也可以使用`export TESSDATA_PREFIX=/home/lstmtest/tessdata`进行指定自己的位置

<font color="green"> 补充 </font>

* 至于不像普通训练那么费事，是因为封装到脚本里了，可以自己看下。同时之所以不需要自己生成训练图片是因为在`tessdata`里提供了一个中文的字体和单词列表，通过字体文件直接进行生成，详细阅读相应的`shell`脚本
* 经过训练同一种字体的不同形态会产生明显的收敛效果，但是不是同一种的就不行，或者说效果不好。
* 同样，你不再需要像传统训练时，添加自定义单词。在特定领域的话，也可以添加一下(哭笑不得)。因为训练的时候，有两种错误率，一种是单字错误率，一种是单词错误率。但也不是下降的越低越好。通常增加训练的迭代次数，会降低错误率。但是这个错误率下的模型可能在会将字体识别正确的同时，将标点识别错误了。
* 合并后，后面带_tmp_的是原字库文件。我们可以把不同`checkpoint`下的`lstm`模型进行合并，类似于这样

```bash
	source ~/.profile

	for file in `ls ./lstmfile/*.lstm` 
	do

		filename=`echo $file | awk -F '/' '{print $3}' | awk -F '_' '{print $1}'`

		combine_tessdata -o ./chi_sim.traineddata \
		  $file \
		  ./chitrain/chi_sim.lstm-number-dawg \
		  ./chitrain/chi_sim.lstm-punc-dawg \
		  ./chitrain/chi_sim.lstm-word-dawg

	mv chi_sim.traineddata $filename.traineddata
	mv chi_sim.traineddata.__tmp__ chi_sim.traineddata

	done
```

最后，这是我从服务器上下载下来的数据，选择了3个较低错误率的数据库下载了下来。前面的数字是错误率。
![lstm_result](../image/Tesseract/lstm_02.png)

#### Resources 
* [Tesseract Documention](https://github.com/tesseract-ocr/tesseract/wiki/Technical-Documentation)
* [Understanding LSTM ](http://colah.github.io/posts/2015-08-Understanding-LSTMs)