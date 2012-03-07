var RectObject = function(x,y,w,h) {
	var self = this;
	
	self.dragging = false;
	self.draggable = true;
	
	self.setDimensions = function(x,y,w,h) {
		self.x = x;
		self.y = y;
		self.width = w;
		self.height = h;
		self.originalX = self.x;
		self.originalY = self.y;
		self.originalWidth = self.width;
		self.originalHeight = self.height;
	}
	
	self.setDimensions(x,y,w,h);
	
	self.setColor = function(c) {
		self.color = c;
		self.draw();
	}
	
	self.draw = function() {
		var ctxt = graphics.getContext(graphics.shapesLayer);
		ctxt.fillStyle = self.color;
		ctxt.fillRect(self.x, self.y, self.width, self.height);
		graphics.mark(self.x, self.y, self.width, self.height);
		//graphics.redraw();
	}
	
	self.undraw = function() {
		var ctxt = graphics.getContext(graphics.shapesLayer);
		ctxt.clearRect(self.x, self.y, self.width, self.height);
		graphics.mark(self.x, self.y, self.width, self.height);
		//graphics.redraw();
	}
	
	self.contains = function(x, y) {
		return x >= self.x && x <= self.x + self.width && y >= self.y && y <= self.y + self.height;
	}
	
	////////////////////////////////////////////////////////////////////////
	// DRAG AROUND
	self.pressed = function(mouseX, mouseY, hasMouse) {
		if (!self.draggable)
			return;
		if (!hasMouse) {
			self.dragging = false;
			return;
		}
		self.dragging = true;
		self.dx = self.x - mouseX;
		self.dy = self.y - mouseY;
		self.drag(mouseX, mouseY);
	}
	
	self.released = function(mouseX, mouseY, hasMouse) {
		self.dragging = false;
	}
	
	self.drag = function(mouseX, mouseY, hasMouse) {
		if (!self.dragging || !self.draggable)
			return;
		
		self.undraw();
		self.x = mouseX + self.dx;
		self.y = mouseY + self.dy;
		self.draw();
	}
	
	////////////////////////////////////////////////////////////////////////
}
