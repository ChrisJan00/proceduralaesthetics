var colors = {
	black : "#000000",
	white : "#FFFFFF",
	lightGrey : "#888888",
	darkGrey : "#444444"
}

var OptionsMenu = function(cnv) {
	var self = this;
	
	self.canvas = cnv; //document.getElementById("optionsmenu");
	self.visible = false;
	self.width = 320;
	self.height = 300;
	
	self.resize = function(w,h) {
		self.canvas.width = w;
		self.canvas.height = h;
		self.canvas.style.width = w;
		self.canvas.style.height = h;
	}
	
	self.init = function() {
		self.UIelements = [];
		
		var obj = self.canvas;
	  	self.xoffset = 0;
	  	self.yoffset = 0;
	  	while (obj) {
	    	self.xoffset += obj.offsetLeft;
	    	self.yoffset += obj.offsetTop;
	    	obj = obj.offsetParent;
	  	}
	}

	
	// show / hide
	self.show = function() {
		self.resize(self.width, self.height);
		self.repaint();
		
		self.canvas.addEventListener('mousemove', self.moveEvent, false);
		self.canvas.addEventListener('mouseup', self.releaseEvent, false);
		self.canvas.addEventListener('mousedown', self.pressEvent, false);
		
		self.visible = true;
	}
	
	self.hide = function() {
		self.resize(0, 0);
		
		self.canvas.removeEventListener('mousemove', self.moveEvent, false);
		self.canvas.removeEventListener('mouseup', self.releaseEvent, false);
		self.canvas.removeEventListener('mousedown', self.pressEvent, false);
		self.visible = false;
	}
	
	self.switchVisible = function() {
		if (self.visible)
			self.hide();
		else
			self.show();
	}

	// repaint
	self.repaint = function() {
		var ctxt = self.canvas.getContext("2d");
		ctxt.fillStyle = colors.white;
		ctxt.fillRect(0,0,self.canvas.width, self.canvas.height);
		
		ctxt.fillStyle = colors.black;
		ctxt.fillRect(0,0,self.canvas.width, 1);
		ctxt.fillRect(0,0,1, self.canvas.height);
		ctxt.fillRect(self.canvas.width - 1,0,1, self.canvas.height);
		ctxt.fillRect(0, self.canvas.height-1, self.canvas.width, 1);
		
		self.compose();
		
		for (var i=0; i<self.UIelements.length; i++)
			self.UIelements[i].redraw();
		
	}
	
	self.mouse = {
		x: 0,
		y: 0
	}
	
	self.readMousePos = function( ev )
	{
		if (ev.layerX || ev.layerX == 0) { // Firefox
    		self.mouse.x = ev.layerX - self.xoffset + self.width/2;
    		self.mouse.y = ev.layerY - self.yoffset + self.height/2;
  		} else if (ev.offsetX || ev.offsetX == 0) { // Opera
    		self.mouse.x = ev.offsetX;
    		self.mouse.y = ev.offsetY;
  		}
	}

	self.pressEvent = function( ev ) {
		self.readMousePos(ev);
		for (var ii=0; ii < self.UIelements.length; ii++)
			if (self.UIelements[ii].managePressed(self.mouse.x, self.mouse.y))
				break;
	}
	
	self.moveEvent = function( ev ) {	
		self.readMousePos(ev);
		for (var ii=0; ii < self.UIelements.length; ii++)
			if (self.UIelements[ii].manageHover(self.mouse.x, self.mouse.y))
				continue;
	}
	
	self.releaseEvent = function( ev ) {
		self.readMousePos(ev);
		for (var ii=0; ii < self.UIelements.length; ii++) 
			if (self.UIelements[ii].manageReleased(self.mouse.x, self.mouse.y))
				break;
	}
	
	self.doNothing = function() {
		// irrellena
	}
	
	/////////////////////// Composing
	self.compose = function() {
		var lastY = 2;
		var ctxt = self.canvas.getContext("2d");
		function drawLabel(label) {
			ctxt.fillStyle = colors.black;
			ctxt.font = "bold 12px sans-serif";
			var textLen = ctxt.measureText(label).width;
			ctxt.fillText(label, self.canvas.width/2 - textLen/2, 14 + lastY);
			lastY += 16;
		}
		function drawButton(x, w, label, callback) {
			self.UIelements.push(new OptionButton(self.canvas, x, lastY+1, w, 14, label, callback));
			lastY += 16;
		}
		function drawButtonRow(buttonArray) {
			var bw = (self.width - 4) / buttonArray.length;
			var storedLastY = lastY;
			for (var ii = 0; ii < buttonArray.length; ii++) {
				lastY = storedLastY;
				drawButton(4+ii*bw, bw-2, buttonArray[ii].label, buttonArray[ii].callback);
			}
		}
		function drawSlider(label, minval, maxval, defval, updateFunc, islog) {
			self.UIelements.push(new OptionSlider(self.canvas, 2,lastY+1,self.width-4,14, label, minval, maxval, defval, updateFunc, islog));
			lastY += 16;
		}
		
		
		///////////////////////////////////////
		
		drawLabel("test123");
		drawButtonRow([ {label:"option 1",callback:self.doNothing }]);
		drawButtonRow([ {label:"option 2",callback:self.doNothing }, {label:"option 3",callback:self.doNothing }])
		drawLabel("awachuwaruwei");
		drawButtonRow([ {label:"option 3",callback:self.doNothing }, {label:"option 4",callback:self.doNothing }])
		drawLabel("and now a slider");
		drawSlider("tonterida", 0.1, 1, 0.5, self.doNothing, false);
		drawSlider("alpha", 0.1, 1, 0.5, self.doNothing, true);
	
		//////////////////////////////////////	
		if (lastY > self.height)
			self.resize(self.width, lastY);
	}
}

var OptionButton = function(canvas, x, y, w, h, text, callBack) {
	var self = this;
	
	self.label = text;
	self.labelColor = colors.black;
	self.x0 = x;
	self.y0 = y;
	self.width = w;
	self.height = h;
	self.canvas = canvas;
	self.ctxt = self.canvas.getContext("2d");
	self.fontSize = 10;
	self.callback = callBack;
	self.hovered = false;
	self.pressed = false;
	
	self.isHover = function(x,y) {
		return x>=self.x0 && x<self.x0 + self.width && y>=self.y0 && y<self.y0 + self.height;
	}
	
	self.manageHover = function(x,y) {
		if (self.pressed)
			return true;
		if (self.hovered && !self.isHover(x,y)) {
			self.hovered = false;
			self.drawNormal();
		} else if ((!self.hovered) && self.isHover(x,y)) {
			self.hovered = true;
			self.drawHover();
		}
		return self.hovered;
	}
	
	self.managePressed = function(x,y) {
		if (!self.isHover(x,y))
			return false;
		self.pressed = true;
		self.drawPressed();
		return true;
	}
	
	self.manageReleased = function(x,y) {
		if (!self.isHover(x,y))
			return false;
		self.drawHover();
		if (self.pressed)
			self.callback();
		self.pressed = false;
		return true;
	}
	
	self.drawNormal = function() {
		self.draw(colors.white);
	}
	
	self.drawHover = function() {
		self.draw(colors.lightGrey);
	}
	
	self.drawPressed = function() {
		self.draw(colors.darkGrey);
	}
	
	self.redraw = function() {
		if (self.pressed)
			self.drawPressed();
		else
		if (self.hovered)
			self.drawHover();
		else
			self.drawNormal();
	}
	
	self.draw = function(bgColor) {
		var ctxt = self.ctxt;
		ctxt.fillStyle = bgColor;
		ctxt.strokeStyle = colors.lightGrey;
		ctxt.fillRect(self.x0, self.y0, self.width, self.height);
		ctxt.strokeRect(self.x0, self.y0, self.width, self.height);
		
		ctxt.fillStyle = self.labelColor;
		ctxt.font = "bold "+self.fontSize+"px CustomFont, sans-serif";
		var textLen = ctxt.measureText(self.label).width;
		ctxt.fillText(self.label, self.x0 + self.width/2 - textLen/2, self.y0 + self.height / 2 + self.fontSize/2 - 2);
	}
	
	self.hide = function() {
		self.ctxt.clearRect(self.x0-1, self.y0-1, self.width+2, self.height+2);
	}
	
}

var OptionSlider = function(canvas, x, y, w, h, text, minval, maxval, defval, callBack, islog) 
{
	var self = this;
	
	self.label = text;
	self.labelColor = colors.black;
	self.x0 = x;
	self.y0 = y;
	self.width = w;
	self.height = h;
	self.canvas = canvas;
	self.ctxt = self.canvas.getContext("2d");
	self.fontSize = 10;
	self.callback = callBack;
	self.hovered = false;
	self.pressed = false;
	self.minval = minval;
	self.maxval = maxval;
	self.currentval = defval;
	self.islog = islog;
	
	self.isHover = function(x,y) {
		return x>=self.x0 && x<self.x0 + self.width && y>=self.y0 && y<self.y0 + self.height;
	}
	
	self.manageHover = function(x,y) {
		if (!self.pressed)
			return false;
		
		var pix = x - self.barBegin;
		if (pix < 0)
			pix = 0;
		if (pix > self.barLen)
			pix = self.barLen;
			
		self.pixToValue(pix);
		self.drawHead();
		self.drawCount();
		self.callback(self.currentval);
		return true;
	}
	
	self.managePressed = function(x,y) {
		if (!self.isHover(x,y))
			return false;
		self.pressed = true;
		self.manageHover(x,y);
		return true;
	}
	
	self.manageReleased = function(x,y) {
		self.pressed = false;
		return false;
	}
	
	self.redraw = function() {
		var ctxt = self.ctxt;

		// label
		ctxt.fillStyle = self.labelColor;
		ctxt.font = "bold "+self.fontSize+"px CustomFont, sans-serif";
		var textLen = ctxt.measureText(self.label).width;
		ctxt.fillText(self.label, self.x0, self.y0 + self.height / 2 + self.fontSize/2 - 2);
		
		// bar + head
		self.barBegin = self.x0 + 60;
		self.barLen = self.width - self.barBegin - 30;
		self.drawHead();
		
		self.drawCount();
	}
	
	self.drawBarBg = function() {
		self.ctxt.fillStyle = colors.white;
		self.ctxt.fillRect(self.barBegin, self.y0, self.barLen, self.height);
	}
	
	self.drawBarFg = function() {
		self.ctxt.strokeStyle = colors.lightGrey;
		self.ctxt.strokeRect(self.barBegin, self.y0, self.barLen, self.height);
	}
	
	self.drawHead = function() {
		self.drawBarBg();
		
		var sliderWidth = self.height;
		var xpos = 0;
		var xrange = self.barLen - sliderWidth;
		if (self.islog) {
			var range = Math.log(self.maxval) - Math.log(self.minval);
			xpos = (Math.log(self.currentval)-Math.log(self.minval)) * xrange / range;
		} else {
			var range = self.maxval - self.minval;
			xpos = (self.currentval - self.minval) * xrange / range;
		}
		self.ctxt.fillStyle = colors.darkGrey;
		self.ctxt.fillRect(xpos + self.barBegin, self.y0, sliderWidth, self.height);
		self.drawBarFg();
	}
	
	self.pixToValue = function(pix) {
		var xrange = self.barLen - self.height;
		var x0 = pix - self.height/2;
		if (self.islog) {
			var range = Math.log(self.maxval) - Math.log(self.minval);
			self.currentval = Math.exp(x0 * range / xrange + Math.log(self.minval))
		} else {
			var range = self.maxval - self.minval;
			self.currentval = x0 * range / xrange + self.minval;
		}
		if (self.currentval < self.minval)
			self.currentval = self.minval;
		if (self.currentval > self.maxval)
			self.currentval = self.maxval;
	}
	
	self.drawCount = function() {
		self.ctxt.fillStyle = colors.white;
		var textpos = self.barBegin + self.barLen + 2;
		self.ctxt.fillRect(textpos, self.y0, self.width - textpos + 3, self.height);
		self.ctxt.fillStyle = self.labelColor;
		self.ctxt.font = "bold "+self.fontSize+"px CustomFont, sans-serif";
		var txt = self.currentval+" ";
		self.ctxt.fillText(txt, textpos + 2, self.y0 + self.height / 2 + self.fontSize/2 - 2);
	}
	
	self.draw = function(bgColor) {
	}
	
	self.hide = function() {
		self.ctxt.clearRect(self.x0-1, self.y0-1, self.width+2, self.height+2);
	}
	
}