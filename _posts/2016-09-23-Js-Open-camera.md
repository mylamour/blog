---
layout: post
title: Use JavaScript To Open Camera And Capture Image
categories: 全栈工程师
tags: 学习笔记
---

```js
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

$("#opencamera").click(function () {
                var video = document.getElementById('video');
                if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                    navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                        video.src = window.URL.createObjectURL(stream);
                        video.play();
                        window.stream = stream;
                    });
                }
            });

$("snap").click(function() {
                $("#VideoCapture").hide();
                scale = 1, offset_x = 0, offset_y = 0, fileType = "image/png";
                context.drawImage(video, 0, 0, video.width, video.height);
                window.stream.getVideoTracks()[0].stop();	//拍到图片后关闭视频流
                uploadType='camera';	
                __post(appId, serviceType, null);		//这里是把照片发送给服务器，__post是自己定义的函数
            });


$('#localfile').change(function(e){
                var _this = $(this)[0], _file = _this.files[0];
                fileType = _file.type;
                $('#imgType').val(fileType);
                if (_this.value==''){
                    return false;
                }
                context.clearRect(0,0,canvas.width,canvas.height);
                if(/image\/\w+/.test(fileType)) {
                    var fileReader = new FileReader();
                    fileReader.readAsDataURL(_file);
                    fileReader.onload = function (event) {
                        var result = event.target.result;   //返回的dataURL
                        __drawFromUrl(result);
                        uploadType='browse';
                        __post(appId, serviceType, null);
                    }
                }
            });


var __post = function(appId, serviceType, url) {
            $("#modal").modal({backdrop:"static"});
            $("#modal").modal("show");
            $("#uploadfaceimg").show();
            if (url != null){
                var postdata = {url: url, serviceType: serviceType};
            }else if (uploadType=='camera'){
                var newImageData = document.getElementById('canvas').toDataURL(fileType, 0.8);　//利用toDataUrl, 把绘制在Canvas上的图片导出.
                var imageBase64 = newImageData.replace("data:"+fileType+";base64,",'');
                var postdata = {imgType: fileType, image: imageBase64, serviceType: serviceType};
            }else if(uploadType=='browse'){
                var formData = new FormData($("#fileform")[0]);
                $.ajax({
                    url: '/me/'+appId+'/detection/detect',
                    type: 'POST',
                    data: formData,
                    async: true,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function(data){
                        __dealdetect(data);
                        $('#localfile').val('');
                    },error: function(){
                        console.log('imgUploader upload fail, data:' +  data);
                    }
                });
                return
            }else{
                console.log('uploadType error');
            }

```

#### Other

这里面的思路是把拍到的图片绘制到canvas上，然后利用canvas的toDataURL,将其以流的方式发送或者保存。

#### Resources

* [blob](https://developer.mozilla.org/zh-CN/docs/Web/API/Blob)
* [readAsDataURL](https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL)
* [createObjectURL](https://developer.mozilla.org/zh-CN/docs/Web/API/URL/createObjectURL)
* [HTMLCanvasElementtoDataURL](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/toDataURL)
