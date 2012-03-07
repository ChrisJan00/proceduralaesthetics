// Mouse Manager
// How to use:
// initialize it by calling registerCanvas( canvas )
// then you can register custom:
// pressedFunction
// releasedFunction
// hoverFunction
// dragFunction

// you should use a different manager instance for each canvas
// right click not supported (this is supposed to be used on touch interfaces)

var MouseManager = function() {
	var self = this;
	
	self.canvas = false;
	self.x = 0;
	self.y = 0;
	self.button = 0;
	self.mouseIsDown = false;
	self.xoffset = 0;
	self.yoffset = 0;
	self.pressedFunction = false;
	self.releasedFunction = false;
	self.hoverFunction = false;
	self.dragFunction = false;
	
	self.registerCanvas = function(canvas) {
		self.canvas = canvas;
		self.connectMouse();
		self.computeOffsets();
	}
	
	self.computeOffsets = function() {
		self.xoffset = 0;
		self.yoffset = 0;
		var object = self.canvas;
		while (object) {
			self.xoffset += object.offsetLeft;
			self.yoffset += object.offsetTop;
			object = object.offsetParent;
		}
	}
	
	self.connectMouse = function() {
		if (!self.canvas)
			return;
		var receiver = self.canvas;
		while (receiver.offsetParent) receiver = receiver.offsetParent;
		
		receiver.addEventListener('mousedown', self.mouseDown, false);
		receiver.addEventListener('mouseup', self.mouseUp, false);
		receiver.addEventListener('mousemove', self.mouseMove, false);
	}
	
	self.disconnectMouse = function() {
		if (!self.canvas)
			return;
		var receiver = self.canvas;
		while (receiver.offsetParent) receiver = receiver.offsetParent;
		
		receiver.removeEventListener('mousedown', self.mouseDown, false);
		receiver.removeEventListener('mouseup', self.mouseUp, false);
		receiver.removeEventListener('mousemove', self.mouseMove, false);
		self.canvas = false;
	}
	
	self.mouseDown = function( ev ) {
		self.mouseIsDown = true;
		self.updateMousePosition( ev );
		if (self.pressedFunction)
			self.pressedFunction();
	}
	
	self.mouseUp = function( ev ) {	
		self.mouseIsDown = false;
		self.updateMousePosition( ev );
		if (self.releasedFunction)
			self.releasedFunction();
	}
	
	self.mouseMove = function( ev ) {
	  self.updateMousePosition( ev );
	  if (self.mouseIsDown && self.dragFunction)
	  	self.dragFunction();
	  if (!self.mouseIsDown && self.hoverFunction)
	  	self.hoverFunction();
	}
	
	self.updateMousePosition = function( ev ) {
		if (ev.layerX || ev.layerX == 0) { // Firefox
	    	self.x = ev.layerX - self.xoffset;
	    	self.y = ev.layerY - self.yoffset;
	   	} else if (ev.offsetX || ev.offsetX == 0) { // Opera
		 	self.x = ev.offsetX;
	    	self.y = ev.offsetY;
		}
	}
}

// clickableObjectManager: not really a subclass, but a "container" of mousemanager?
// you can call registerObject(object)
// it needs to have:
// x,y,width,height
// pressed/released/hover/drag

// note: all objects will be checked, no consumption possible

var ClickableObjectManager = function() {
	var self = this;
	self.mouseManager = new MouseManager();
	self.registeredObjects = [];
	
	self.registerCanvas = function(canvas) {
		self.mouseManager.registerCanvas(canvas);
	}
	
	self.registerObject = function(object) {
		if (self.registeredObjects.indexOf(object) != -1)
			return;
		// check if it has position properties
		if (!self.objectHas(object.x) || !self.objectHas(object.y) || !self.objectHas(object.width) || !self.objectHas(object.height))
			return;
			
		// check if it has at least one mouse hook
		if (!self.objectHas(object.pressed) && !objectHas(object.released) && !objectHas(object.hover) && !objectHas(object.drag))
			return;
			
		self.registeredObjects.push(object);
	}
	
	self.objectHas = function(func) {
		return typeof(func) != "undefined";
	}
	
	self.objectMoused = function(index) {
		return self.mouseManager.x >= self.registeredObjects[index].x 
			&& self.mouseManager.x <= self.registeredObjects[index].x + self.registeredObjects[index].width
			&& self.mouseManager.y >= self.registeredObjects[index].y
			&& self.mouseManager.y <= self.registeredObjects[index].y + self.registeredObjects[index].height;
	}
	
	self.unregisterObject = function(object) {
		self.registeredObjects.splice(object);
	}
	
	self.pressedFunction = function() {
		for (var ii=0; ii < self.registeredObjects.length; ii++) {
			if (self.objectHas(self.registeredObjects[ii].pressed))
				self.registeredObjects[ii].pressed(self.mouseManager.x, self.mouseManager.y, self.objectMoused(ii));
		}
	}
	
	self.releasedFunction = function() {
		for (var ii=0; ii < self.registeredObjects.length; ii++) {
			if (self.objectHas(self.registeredObjects[ii].released))
				self.registeredObjects[ii].released(self.mouseManager.x, self.mouseManager.y, self.objectMoused(ii));
		}
	}
	
	self.hoverFunction = function() {
		for (var ii=0; ii < self.registeredObjects.length; ii++) {
			if (self.objectHas(self.registeredObjects[ii].hover))
				self.registeredObjects[ii].hover(self.mouseManager.x, self.mouseManager.y, self.objectMoused(ii));
		}
	}
	
	self.dragFunction = function() {
		for (var ii=0; ii < self.registeredObjects.length; ii++) {
			if (self.objectHas(self.registeredObjects[ii].drag))
				self.registeredObjects[ii].drag(self.mouseManager.x, self.mouseManager.y, self.objectMoused(ii));
		}
	}
	
	self.mouseManager.pressedFunction = self.pressedFunction;
	self.mouseManager.releasedFunction = self.releasedFunction;
	self.mouseManager.hoverFunction = self.hoverFunction;
	self.mouseManager.dragFunction = self.dragFunction;
}
