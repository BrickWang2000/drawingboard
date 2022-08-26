
function Position(x, y){
	this.x = x;
	this.y = y;
}
 
var Vector = function (x, y) {
    var vec = {
        vx: x,
        vy: y,
        // 缩放
        scale: function (scale) {
            vec.vx *= scale;
            vec.vy *= scale;
        },
        //加 另一个向量
        add: function (vec2) {
            vec.vx += vec2.vx;
            vec.vy += vec2.vy;
        },
        //减 另一个向量
        sub: function (vec2) {
            vec.vx -= vec2.vx;
            vec.vy -= vec2.vy;
		},
		equal:function(vec2){
			if((Math.abs(vec2.vx - vec.vx) < 0.01) && (Math.abs(vec2.vy - vec.vy) < 0.01))
				return true;
			return false;
		},
        //相反方向
        negate: function () {
            vec.vx = -vec.vx;
            vec.vy = -vec.vy;
        },
        //向量长度
        length: function () {
            return Math.sqrt(vec.vx * vec.vx + vec.vy * vec.vy);
        },
        //向量长度的平方
        lengthSquared: function () {
            return vec.vx * vec.vx + vec.vy * vec.vy;
        },
        //标准化
        normalize: function () {
            var len = Math.sqrt(vec.vx * vec.vx + vec.vy * vec.vy);
            if (len) {
                vec.vx /= len;
                vec.vy /= len;
            }
            return len;
		},
        //旋转
        rotate: function (angle) {
            var vx = vec.vx,
                vy = vec.vy,
                cosVal = Math.cos(angle),
                sinVal = Math.sin(angle);
            vec.vx = vx * cosVal - vy * sinVal;
            vec.vy = vx * sinVal + vy * cosVal;
        },
        //调试
        toString: function () {
            return '(' + vec.vx.toFixed(3) + ',' + vec.vy.toFixed(3) + ')';
        }
    };
    return vec;
};
 
function Draw(context){
	this.context = context;
}
 
function Circle(context, center){
	Draw.call(this, context);
	this.center = center;
	this.radius = 10.0;
}
Circle.prototype = new Draw();
Circle.prototype.draw = function(){
	//外圆
	this.context.fillStyle = "#555555";
	this.context.strokeStyle = "#333333";
	this.context.beginPath();
	this.context.arc(this.center.x, this.center.y, this.radius, 0, 2*Math.PI, true);
	this.context.closePath();
	this.context.stroke();
	this.context.fill();
	//内圆
	this.context.fillStyle = "#888888";
	this.context.beginPath();
	this.context.arc(this.center.x, this.center.y, this.radius * 0.5, 0, 2*Math.PI, true);
	this.context.closePath();
	this.context.fill();
};
 
function Line(context, lineWeight, startPosition, endPosition){
	Draw.call(this, context);
	this.startPosition = startPosition;
	this.endPosition = endPosition;
	this.strokeStyle = "rgba(0,255,0,1.0)";
	this.lineWeight = lineWeight;
}
Line.prototype = new Draw();
Line.prototype.draw = function(){
	this.context.strokeStyle = this.strokeStyle;
	this.context.lineWidth = this.lineWeight;
	this.context.moveTo(this.startPosition.x, this.startPosition.y);
	this.context.lineTo(this.endPosition.x, this.endPosition.y);
	this.context.stroke();
};
 
Line.prototype.select = function(position){
	var v1 = Vector((position.x - this.startPosition.x), (position.y - this.startPosition.y));
	var dir1 = Vector((position.x - this.startPosition.x), (position.y - this.startPosition.y));
	dir1.normalize();
 
	var v2 = Vector((this.endPosition.x - this.startPosition.x), (this.endPosition.y - this.startPosition.y));
	var dir2 = Vector((this.endPosition.x - this.startPosition.x), (this.endPosition.y - this.startPosition.y));
	dir2.normalize();
 
	//判断方向向量和距离
	if(dir1.equal(dir2) && v1.length() <= v2.length()){
		this.strokeStyle =  "rgba(0,255,255,0.5)";
		return true;
	}
	else 
		this.strokeStyle =  "rgba(0,255,0,1.0)";
	return false;
};
 
function Arrow(context, startPosition, endPosition){
	Draw.call(this, context);
	this.startPosition = startPosition;
	this.endPosition = endPosition;
}
Arrow.prototype = new Draw();
Arrow.prototype.draw = function(){
	var step = 15;
	var dir = Vector((this.endPosition.x - this.startPosition.x), (this.endPosition.y - this.startPosition.y));
	dir.normalize();
	this.context.fillStyle = "rgba(0,255,0,0.2)";
	this.context.save();
	this.context.translate(this.endPosition.x - step * dir.vx, this.endPosition.y - step * dir.vy);
	
	this.context.moveTo(-step * dir.vy , step * dir.vx);
	this.context.lineTo(step * dir.vx, step * dir.vy);
	this.context.lineTo(step * dir.vy , -step * dir.vx);
	this.context.stroke();
	this.context.restore();
}
 
function TextString(text, context, startPosition, endPosition){
	Draw.call(this, context);
	this.startPosition = startPosition;
	this.endPosition = endPosition;
	this.strokeStyle =  "rgba(0,255,0,1.0)";
	this.text = text;
}
TextString.prototype = new Draw();
TextString.prototype.draw = function(){
	this.context.fillStyle = "#ff0000";
	this.context.strokeStyle = "green";
	this.context.font = "20px sans-serif";
	this.context.fillText(this.text, this.startPosition.x, this.startPosition.y);
};
 
function BeltWeight(name, context, startPosition, endPosition){
	Draw.call(this, context);
	this.circle = new Circle(context, startPosition);
	this.line = new Line(context, 5, startPosition, endPosition);
	this.arrow = new Arrow(context, startPosition, endPosition);
	this.text = new TextString(name, context, startPosition, endPosition);
}
BeltWeight.prototype = new Draw();
BeltWeight.prototype.draw = function(){
	this.circle.draw();
	this.line.draw();
	this.arrow.draw();
	this.text.draw();
}
 
BeltWeight.prototype.select = function(position){
	return this.line.select(position);
}
 
function Belt(name, context, startPosition, endPosition){
	Draw.call(this, context);
	this.startCircle = new Circle(context, startPosition);
	this.line = new Line(context, 10, startPosition, endPosition);
	this.endCircle = new Circle(context, endPosition);
	this.text = new TextString(name, context, startPosition, endPosition);
}
Belt.prototype = new Draw();
Belt.prototype.draw = function(){
	this.startCircle.draw();
	this.line.draw();
	this.endCircle.draw();
	this.text.draw();
}
 
Belt.prototype.select = function(position){
	return this.line.select(position);
}
 
var entityType = 0;
function selectEntity(type){
	entityType = type;
}
 
function Handle(context, clientWidth, clientHeight){
	this.context = context;
	this.clientWidth = clientWidth;
	this.clientHeight = clientHeight;
 
	this.mouseFlag = false;
	this.startPosition = null;
	this.endPosition = null;
 
	this.beltWeights = [];
	this.belts = [];
	this.curEntity = null;
	this.selectBeltIndex = -1;
	this.selectBeltWeightIndex = -1;
	this.entityType = 0;
}
 
Handle.prototype.setEntityType = function(entityType){
	this.entityType = entityType;
}
 
Handle.prototype.mousedown = function(position){
	this.mouseFlag = true;
	this.startPosition = position;
};
 
Handle.prototype.mousemove = function(position){
	this.endPosition = position;
	this.context.clearRect(0,0,this.clientWidth, this.clientHeight);
	this.selectBeltWeightIndex = -1;
	this.selectBeltIndex = -1;
 
	if(this.mouseFlag){
 
		if(entityType == 0)
			this.curEntity = new BeltWeight("BeltWeight" + this.beltWeights.length, this.context, this.startPosition, this.endPosition);
		else
			this.curEntity = new Belt("Belt" + this.belts.length, this.context, this.startPosition, this.endPosition);
		this.curEntity.draw();
 
		for(var index=0; index<this.beltWeights.length; ++index){
			this.beltWeights[index].select(position);
			this.beltWeights[index].draw();
		}
 
		for(var index=0; index<this.belts.length; ++index){
			this.belts[index].select(position);
			this.belts[index].draw();
		}
 
	}else{
 
		for(let index=0; index<this.beltWeights.length; ++index){
			var bSelect = this.beltWeights[index].select(position);
			if(bSelect)
				this.selectBeltWeightIndex = index;
			this.beltWeights[index].draw();
		}
 
		for(let index=0; index<this.belts.length; ++index){
			var bSelect = this.belts[index].select(position);
			if(bSelect)
				this.selectBeltIndex = index;
			this.belts[index].draw();
		}
	}
};
 
Handle.prototype.mouseup = function(){
	this.mouseFlag = false;
 
	if(entityType == 0){
		this.beltWeights.push(this.curEntity);
	}else{
		this.belts.push(this.curEntity);
	}
 
	this.context.clearRect(0,0,this.clientWidth,this.clientHeight);
	for(let index=0; index<this.beltWeights.length; ++index){
		this.beltWeights[index].draw();
	}
 
	for(let index=0; index<this.belts.length; ++index){
		this.belts[index].draw();
	}
};
 
Handle.prototype.keydown = function(){
 
	if(this.selectBeltWeightIndex != -1)
		this.beltWeights.splice(this.selectBeltWeightIndex, 1);
	this.selectBeltWeightIndex = -1;
 
	if(this.selectBeltIndex != -1)
		this.belts.splice(this.selectBeltIndex, 1);
	this.selectBeltIndex = -1;
 
 
	this.context.clearRect(0,0,this.clientWidth, this.clientHeight);
 
	for(let index=0; index<this.beltWeights.length; ++index){
		this.beltWeights[index].draw();
	}
 
	for(let index=0; index<this.belts.length; ++index){
		this.belts[index].draw();
	}
};
 
window.onload = function() {
	var canvas = document.getElementById('c1');
	if ( ! canvas || ! canvas.getContext ) { return false; }
	var handle = new Handle(canvas.getContext('2d'), canvas.clientWidth, canvas.clientHeight);
 
	canvas.onmousedown = function(ev) {
		var ev = ev || window.event;
		handle.mousedown(new Position(ev.clientX-canvas.offsetLeft,ev.clientY-canvas.offsetTop));
	};
 
	canvas.onmousemove = function(ev) {
		var ev = ev || window.event;//获取event对象
		handle.mousemove(new Position(ev.clientX-canvas.offsetLeft,ev.clientY-canvas.offsetTop));
	};
 
	canvas.onmouseup = function(ev) {
		document.onmousemove = null;
		document.onmouseup = null;
		handle.mouseup();
	};
 
	function onkeydown(e) {
			var keyID = e.keyCode ? e.keyCode :e.which;
			if(keyID === 46)  { // delete
				handle.keydown();
				e.preventDefault();
			}
		}
 
	canvas.addEventListener('keydown', onkeydown, true);
	window.addEventListener('keydown', onkeydown, true);
};