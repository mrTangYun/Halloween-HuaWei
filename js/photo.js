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
	this.canvas = null;
	this.imageReady = false;
	this.wxReady = true;
	this.images = [];
	this.pic = new Image();
	this.outerImg = null;
	this.outerImgIndex = null;
	this.grayBgImg = null;
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

		$("#inputFile").on('change', function(event) {
			event.preventDefault();
			/* Act on the event */
			var file    = $(this)[0].files[0];
			var reader  = new FileReader();

			reader.addEventListener("load", function () {
			    //preview.src = reader.result;
			    that.pic.src = reader.result;
			}, false);
			if (file) {
			    reader.readAsDataURL(file);
			}
		});

		$("#btn-djsczp").on('click', function(event) {
			$("#btn-djsczp").addClass('hide');
			$("#inputFile").click();
			setTimeout(function(){
				$("#btn-djsczp").remove();
			},1000);
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
		canvas.width = 2000;
		canvas.height = 2450;

		var WIDTH = canvas.width;
		var HEIGHT = canvas.height;

		
		if (that.grayBgImg){
			ctx.drawImage(that.grayBgImg,WIDTH*.075,HEIGHT*.065,WIDTH*.854,HEIGHT*.717);
		}
		ctx.drawImage(that.outerImg,0,0,WIDTH,HEIGHT);

	};
	this.init = function(){
		console.log("开始初始化");

		var that = this;
		that.canvas = document.getElementById("canvas");
		var canvas = that.canvas;
		var ctx = canvas.getContext("2d");
		canvas.width = 2000;
		canvas.height = 2450;

		var WIDTH = canvas.width;
		var HEIGHT = canvas.height;

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
				y,
				cImg = {
					r : 0,	//旋转
					x : 0,
					y : 0,
					w : WIDTH,
					h : HEIGHT,
					f : 0, 	//0长宽相等，1比c高，2比c宽,
					c : 1,	//缩放
					rx : .5,
					ry : .5
				};
			if (rC > rI){
				//如果图片的长宽比比canvas的小
				h =  WIDTH / rI ;
				cImg.y = (HEIGHT - h)/2 - HEIGHT/2 ;
				cImg.x = WIDTH / -2;
				cImg.h = h;
				cImg.f = 1;
			}
			else if (rC < rI){
				//如果图片的长宽比比canvas的大
				w =  HEIGHT * rI;
				cImg.x = (WIDTH-w)/2 - WIDTH/2;
				cImg.y = HEIGHT / -2;
				cImg.w = w;
				cImg.f = 2;
			}
			//console.log("图片加载完毕，画图");
			$("#btn-pre,#btn-next").hide();
			draw(ctx,cImg);

			function draw(ctx,cImg){
				ctx.clearRect(0, 0, WIDTH, HEIGHT);
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
				ctx.drawImage(img,cImg.x,cImg.y,cImg.w,cImg.h);
				ctx.restore();
				ctx.drawImage(that.outerImg,0,0,WIDTH,HEIGHT);
			}

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
				cImg.r -= r;
				var radians = cImg.r * Math.PI / 180;
				cImg.x = cImg.x +  (ev.center.x - lastPan.x) * Math.cos(radians) + (ev.center.y - lastPan.y) * Math.sin(radians);
				cImg.y = cImg.y +  (ev.center.y - lastPan.y) * Math.cos(radians) - (ev.center.x - lastPan.x) * Math.sin(radians);
				draw(ctx,cImg);
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
				cImg.c -= (lastScale-ev.scale);
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
				var radians = cImg.r * Math.PI / 180;
				cImg.x = cImg.x +  2*(ev.center.x - lastPan.x) * Math.cos(radians) + (ev.center.y - lastPan.y) * Math.sin(radians);
				cImg.y = cImg.y +  2*(ev.center.y - lastPan.y) * Math.cos(radians) - (ev.center.x - lastPan.x) * Math.sin(radians);
				
				draw(ctx,cImg);
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
		return this.canvas.toDataURL("image/png");
	};
}

var game = new Game();
jQuery(document).ready(function($) {
	var myLoad = new ImagesLoad();
	myLoad.add('./images/0.png');
	myLoad.add('./images/1.png');
	myLoad.add('./images/2.png');
	myLoad.add('./images/gray-bg.png');

	myLoad.callback = function(){
		game.setImageReady(this);
	}
	//outerImg.src = "./images/1.png";
   
    
});