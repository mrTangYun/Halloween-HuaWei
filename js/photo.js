//获取微信配置的地址
var ajax_wx = "http://hyundai.koo7.com/index.php/jsonBack";
//var ajax_wx = "http://m.yx.renren.com/2495/wxShare";
//获取服务器图片的地址
var ajax_serverid2url = "../serverid2url";		
var Poto_width = 240;	//生成图片的宽度
var Poto_height = 280;	//生成图片的高度



function ImagesLoad(){
    this.loadedCount = 0;
    this.callback = null;
    this.array = [];
}
ImagesLoad.prototype.add = function(url){
    var that = this;
    var img = new Image();
    that.array.push(img);
    img.src = url;
    img.onload = function(){
        that.loadedCount ++;
        if (that.loadedCount == that.array.length){
            
            if ( typeof(that.callback) === 'function'){
                that.callback();
            }
        }
    }
}

function Game(){
	this.canvas2 = null;
	this.canvas = null;
	this.imageReady = false;
	this.wxReady = false;
	this.images = [];
	this.pic = new Image();
	this.outerImg = null;
	this.outerImgIndex = null;
	this.grayBgImg = null;
	this.cImg = {
					i : false, //是否存在数据
					r : 0,	//旋转
					x : 0,
					y : 0,
					w : 0,
					h : 0,
					f : 0, 	//0长宽相等，1比c高，2比c宽,
					c : 1,	//缩放
					rx : .5,
					ry : .5
				};
	this.setImageReady = function(images){
		this.images = images;
		this.imageReady = true;
		this.outerImgIndex = 0;
		this.outerImg = this.images.array[this.outerImgIndex];
		this.grayBgImg = this.images.array[3];
		console.log("图片准备完毕");
		if (this.wxReady){
			this.init();
		}
	};
	this.setWxReady = function(){
		this.wxReady = true;
		console.log("微信准备完毕");
		if (this.imageReady){
			this.init();
		}
	};
	this.bindEvent = function(){
		var that = this;

		document.body.addEventListener('touchmove', function (event) {
		    event.preventDefault();
		}, false);

		$("#btn-djsczp").on('click', function(event) {
			$("#btn-djsczp").addClass('hide');
			wx.chooseImage({
			    count: 1, // 默认9
			    sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
			    sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
			    success: function (res) {
			        var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片

			        chooseImage = 1;
			        
					wx.uploadImage({
					    localId: localIds[0], // 需要上传的图片的本地ID，由chooseImage接口获得
					    isShowProgressTips: 1, // 默认为1，显示进度提示
					    success: function (res) {
					        var serverId = res.serverId; // 返回图片的服务器端ID
					        //alert("serverId::"+serverId)
					        
					        $.ajax({
					        	url: ajax_serverid2url,
					        	type: 'POST',
					        	dataType: 'json',
					        	data: {serverId: serverId},
					        })
					        .done(function(json) {
					        	that.pic.src = 'http://m.yx.renren.com/2495/proxy?url=' + json.url;
					        	console.log("success:获取服务器图片的接口成功");
					        })
					        .fail(function() {
					        	console.log("error:获取服务器图片的接口错误");
					        	that.pic.src = localIds;
					        })
					        .always(function() {
					        	console.log("complete");
					        });
					        
					    }
					});		        

  
			    },
			    cancel: function(){
				  	$("#btn-djsczp").show();
				  	setTimeout(function(){
				  		$("#btn-djsczp").removeClass('hide');
				  	},1);
			    },
			    fail: function(){
				  	$("#btn-djsczp").show();
				  	setTimeout(function(){
				  		$("#btn-djsczp").removeClass('hide');
				  	},1);
			    }
			});
		});

		$("#btn-pre").on('touchstart', function(event) {
			event.preventDefault();
			/* Act on the event */
			var i = that.outerImgIndex;
			i = i-1 < 0 ? 2 : i-1;
			that.changeOuterImg(i);
		});

		$("#btn-next").on('touchstart', function(event) {
			event.preventDefault();
			/* Act on the event */
			var i = that.outerImgIndex;
			i = i+1 > 2 ? 0 : i+1;
			that.changeOuterImg(i);
		});

	};
	this.drawGray = function(){
		
	};
	this.draw = function(){
		var that = this;
		var canvas = that.canvas;
		var ctx = canvas.getContext("2d");

		var WIDTH = canvas.width;
		var HEIGHT = canvas.height;
		var cImg = that.cImg;
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		
		//console.log("hello");
		if (that.grayBgImg && !cImg.i){
			ctx.drawImage(that.grayBgImg,WIDTH*.075,HEIGHT*.065,WIDTH*.854,HEIGHT*.717);
		}
		if (cImg.i){
			ctx.save();
			ctx.beginPath();
			ctx.moveTo(WIDTH*.075, HEIGHT*.065);
			ctx.lineTo(WIDTH*.075+WIDTH*.854,HEIGHT*.065);
			ctx.lineTo(WIDTH*.075+WIDTH*.854,HEIGHT*.065+HEIGHT*.717);
			ctx.lineTo(WIDTH*.075,HEIGHT*.065+HEIGHT*.717);
			ctx.closePath();
			ctx.fillStyle = "#fff";
			ctx.fill();
			ctx.clip();
			ctx.translate(WIDTH/2,HEIGHT/2);
			ctx.rotate(cImg.r *Math.PI /180);
			//console.log(cImg.r);
			ctx.scale(cImg.c,cImg.c);
			ctx.drawImage(that.pic,cImg.x,cImg.y,cImg.w,cImg.h);
			ctx.restore();
		}
		ctx.drawImage(that.outerImg,0,0,WIDTH,HEIGHT);

	};
	this.init = function(){
		console.log("开始初始化");

		var that = this;
		this.canvas2 = document.getElementById("canvas2");
		this.canvas2.width = Poto_width;
		this.canvas2.height = Poto_height;
		that.canvas = document.getElementById("canvas");
		var canvas = that.canvas;
		var ctx = canvas.getContext("2d");
		canvas.width = 2000;
		canvas.height = 2450;

		var WIDTH = canvas.width;
		var HEIGHT = canvas.height;

		that.cImg.w = WIDTH;
		that.cImg.h = HEIGHT;

		var hammertime = new Hammer(canvas);
		hammertime.get('rotate').set({ enable: true });
		hammertime.get('pinch').set({ enable: true });
		hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });

		
		if (that.grayBgImg){
			ctx.drawImage(that.grayBgImg,WIDTH*.075,HEIGHT*.065,WIDTH*.854,HEIGHT*.717);
		}
		ctx.drawImage(that.outerImg,0,0,WIDTH,HEIGHT);

		this.pic.onload = function(e){
			var img = this;
			var imgWidth = img.width,
				imgHeight = img.height,
				rC = WIDTH / HEIGHT,
				rI = imgWidth / imgHeight,
				w,
				y;
			if (rC > rI){
				//如果图片的长宽比比canvas的小
				h =  WIDTH / rI ;
				that.cImg.y = (HEIGHT - h)/2 - HEIGHT/2 ;
				that.cImg.x = WIDTH / -2;
				that.cImg.h = h;
				that.cImg.f = 1;
			}
			else if (rC < rI){
				//如果图片的长宽比比canvas的大
				w =  HEIGHT * rI;
				that.cImg.x = (WIDTH-w)/2 - WIDTH/2;
				that.cImg.y = HEIGHT / -2;
				that.cImg.w = w;
				that.cImg.f = 2;
			}
			//$("#btn-pre,#btn-next").hide();
			that.cImg.i = true;
			that.draw();

			var lastRotate = 0,
				lastScale = 0,
				lastPan = {x :0,y:0};
			hammertime.on('rotatestart', function(ev) {
				//console.log('rotatestart' ,ev);
				lastRotate = ev.rotation;
				lastPan = ev.center;
			});
			hammertime.on('rotatemove', function(ev) {
				//console.log('rotatemove' ,ev);
				var r = lastRotate - ev.rotation;
				that.cImg.r -= r;
				var radians = that.cImg.r * Math.PI / 180;
				that.cImg.x = that.cImg.x +  (ev.center.x - lastPan.x) * Math.cos(radians) + (ev.center.y - lastPan.y) * Math.sin(radians);
				that.cImg.y = that.cImg.y +  (ev.center.y - lastPan.y) * Math.cos(radians) - (ev.center.x - lastPan.x) * Math.sin(radians);
				that.draw();
				lastRotate = ev.rotation;
				lastPan = ev.center;
			});
			hammertime.on( "rotateend", function( ev ) {
				//console.log("rotateend" ,ev);
				lastRotate = ev.rotation;
				lastPan = ev.center;
    		});

			hammertime.on('pinchstart', function(ev) {
				//console.log('pinchstart' ,ev.scale);
				lastScale = ev.scale;
			});
			hammertime.on('pinchmove', function(ev) {
				//console.log('pinchmove' ,ev.scale);
				that.cImg.c -= (lastScale-ev.scale);
				lastScale = ev.scale;
			});
			hammertime.on( "pinchend", function( ev ) {
				//console.log("pinchend" ,ev.scale);
				lastScale = ev.scale;
    		});


    		hammertime.on("panstart", function( ev ) {
				lastPan = ev.center;
    		});
    		hammertime.on("panend", function( ev ) {
				lastPan = ev.center;
    		});
    		hammertime.on("panmove", function( ev ) {
				var radians = that.cImg.r * Math.PI / 180;
				that.cImg.x = that.cImg.x +  4*(ev.center.x - lastPan.x) * Math.cos(radians) + (ev.center.y - lastPan.y) * Math.sin(radians);
				that.cImg.y = that.cImg.y +  4*(ev.center.y - lastPan.y) * Math.cos(radians) - (ev.center.x - lastPan.x) * Math.sin(radians);
				
				that.draw();
				lastPan = ev.center;
    		});
		}		

		that.bindEvent();

		$("#btn-djsczp,#btn-pre,#btn-next,.canvasOuter").removeClass('hide');

	};
	this.changeOuterImg = function(index){
		this.outerImgIndex = index;
		this.outerImg = this.images.array[this.outerImgIndex];
		this.draw();
	};
	this.getBase64 = function(){
		var ctx2 = this.canvas2.getContext("2d");
		var ctx = this.canvas.getContext("2d");
		ctx2.drawImage(this.canvas,0,0,this.canvas.width,this.canvas.height,0,0,this.canvas2.width,this.canvas2.height);
		return this.canvas2.toDataURL("image/png");
	};
}

var game = new Game();

jQuery(document).ready(function($) {
    var url= location.href;
    var appId="";
    var timestamp="";
    var nonceStr="";
    var signature="";
    var urlBack="";
    $.ajax({
        type: 'GET',
        url: ajax_wx,
        data:{"url":url},
        dataType: 'json',
        async: false,
        success: function(data) {
        	
        	appId=data.appId;
        	timestamp=data.timestamp;
        	nonceStr=data.nonceStr;
        	signature=data.signature;
        	urlBack=data.url;
            wx.config({
                //debug: true,
                appId:appId,
                timestamp: timestamp,
                nonceStr: nonceStr,
                signature: signature,
                jsApiList: [
                    'checkJsApi',
                    'onMenuShareTimeline',
                    'onMenuShareAppMessage',
                    'onMenuShareQQ',
                    'onMenuShareWeibo',
                    'chooseImage',
                    'uploadImage'
                ]
            });
        }
    });
	var myLoad = new ImagesLoad();
	myLoad.add('./images/0.png');
	myLoad.add('./images/1.png');
	myLoad.add('./images/2.png');
	myLoad.add('./images/gray-bg.png');

	myLoad.callback = function(){
		game.setImageReady(this);
	}
	//outerImg.src = "./images/1.png";
    wx.ready(function () {
    	game.setWxReady();
    });	
    
});