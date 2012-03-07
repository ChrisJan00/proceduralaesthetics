// zoomable scene
function randColor(n) {
//	switch(Math.floor(Math.random() * 4)) {
	switch(n % 6) {
		case 0: return "#CC52AA";
		case 1: return "#234567";
		case 2: return "#43927D";
		case 3: return "#B29311";
		case 7: return "#CC52AA";
		case 6: return "#234567";
		case 5: return "#43927D";
		case 4: return "#B29311";
	}
}

// we have to translate all coords according to zoom
var SceneManager = function() {
	var self = this;

	self.vignetteWidth = 800;
	self.vignetteHeight = 600;
	self.vignetteDx = 100;
	self.vignetteDy = 75;
		
	self.totalWidth = self.vignetteWidth * 4 + self.vignetteDx * 4;
	self.totalHeight = self.vignetteHeight * 4 + self.vignetteDy * 4;
	
	self.viewX = 0;
	self.viewY = 0;
	self.viewWidth = self.totalWidth;
	self.viewHeight = self.totalHeight;
	
	self.rects = [];
	
	self.init = function() {
		self.x = 0;
		self.y = 0;
		self.width = graphics.width;
		self.height = graphics.height;
		
		for (var y = 0; y < 4; y++)
			for (var x = 0; x < 4; x++) {
				self.rects.push(new RectObject(self.vignetteDx/2 + x*(self.vignetteWidth+self.vignetteDx), 
					self.vignetteDy/2 + y*(self.vignetteHeight + self.vignetteDy), self.vignetteWidth, self.vignetteHeight));
				self.rects[self.rects.length-1].color = randColor((x+1)*(y%3+1));
				self.rects[self.rects.length-1].gridPos = x + y*4;
			}
		self.repositionItems();
	}
	
	self.repositionItems = function() {
		var xScale = graphics.width / self.viewWidth;
		var yScale = graphics.height / self.viewHeight;
		for (var ii=0; ii < self.rects.length; ii++) {
			self.rects[ii].x = Math.floor((self.rects[ii].originalX - self.viewX)* xScale);
			self.rects[ii].y = Math.floor((self.rects[ii].originalY - self.viewY) * yScale);
			self.rects[ii].width = Math.floor(self.rects[ii].originalWidth * xScale);
			self.rects[ii].height = Math.floor(self.rects[ii].originalHeight * yScale);
		}
	}
	
	self.setView = function(x, y, width, height) {
		self.viewX = x;
		if (self.viewX < 0)
			self.viewX = 0;
			
		self.viewY = y;
		if (self.viewY < 0)
			self.viewY = 0;
			
		self.viewWidth = Math.min(width, self.totalWidth);
		if (self.viewX + self.viewWidth >= self.totalWidth)
			self.viewX = self.totalWidth - self.viewWidth;
			
		self.viewHeight = Math.min(height, self.totalHeight);
		if (self.viewY + self.viewHeight >= self.totalHeight)
			self.viewY = self.totalHeight - self.viewHeight;
			
		self.repositionItems();
	}
	
	self.draw = function() {
		for (var ii=0; ii < self.rects.length; ii++)
			if (self.rects[ii].x < graphics.width && self.rects[ii].x + self.rects[ii].width >= 0
				&& self.rects[ii].y < graphics.height && self.rects[ii].y + self.rects[ii].height >= 0)
					self.rects[ii].draw();
		graphics.redraw();
	}
	
	self.undraw = function() {
		for (var ii=0; ii < self.rects.length; ii++)
			if (self.rects[ii].x < graphics.width && self.rects[ii].x + self.rects[ii].width >= 0
				&& self.rects[ii].y < graphics.height && self.rects[ii].y + self.rects[ii].height >= 0)
				self.rects[ii].undraw();
		graphics.redraw();
	}
	
	/////////////////////////////////////
	self.convertFromMouseX = function(mouseX) {
		var invXScale = self.viewWidth / graphics.width;
		return self.viewX + mouseX * invXScale;
	}
	self.convertFromMouseY = function(mouseY) {
		var invYScale = self.viewHeight / graphics.height;
		return self.viewY + mouseY * invYScale;
	}
	self.convertToMouseX = function(localX) {
		var xScale = graphics.width / self.viewWidth;
		return Math.floor((localX - self.viewX) * xScale);
	}
	self.convertToMouseY = function(localY) {
		var yScale = graphics.height / self.viewHeight;
		return Math.floor((localY - self.viewY) * yScale);
	}
	
	self.zoomed = false;
	self.moving = false;
	self.pressed = function(mouseX, mouseY, hasMouse) {
		if (self.moving)
			return;
		if (!self.zoomed) {
			for (var ii=0; ii<self.rects.length; ii++) {
				if (self.rects[ii].contains(mouseX, mouseY)) {
					self.zoomed = self.rects[ii];
					self.clearControls();
					self.gotoRect(ii);
					break;
				}
			}
		} else {
			// corners
			if ((mouseX < self.zoomed.x && mouseY < self.zoomed.y) || 
				(mouseX > self.zoomed.x + self.zoomed.width && mouseY < self.zoomed.y) ||
				(mouseX < self.zoomed.x && mouseY > self.zoomed.y + self.zoomed.height) ||
				(mouseX > self.zoomed.x + self.zoomed.width && mouseY > self.zoomed.y + self.zoomed.height)) {
				self.zoomed = false;
				self.clearControls();
				self.gotoView(0, 0, self.totalWidth, self.totalHeight);
				return;
			}
			
			var gridX = self.zoomed.gridPos % 4;
			var gridY = Math.floor(self.zoomed.gridPos / 4);
			var gridPos = self.zoomed.gridPos;
			if (mouseX < self.zoomed.x && gridX>0)
				gridPos = gridX-1+gridY*4;
			
			if (mouseX > self.zoomed.x + self.zoomed.width && gridX<3)
				gridPos = gridX+1+gridY*4;
			
			if (mouseY < self.zoomed.y && gridY>0)
				gridPos = gridX+(gridY-1)*4;
				
			if (mouseY > self.zoomed.y + self.zoomed.height && gridY<3)
				gridPos = gridX+(gridY+1)*4;
				
			if (gridPos != self.zoomed.gridPos) {
				for (var ii=0; ii<self.rects.length; ii++)
					if (self.rects[ii].gridPos == gridPos) {
						self.zoomed = self.rects[ii];
						self.clearControls();
						self.gotoRect(ii);
						break;
					}
			}
		}
	}
	
	self.gotoRect = function(ii) {
		self.gotoView( self.rects[ii].originalX - self.vignetteDx*1.5, self.rects[ii].originalY - self.vignetteDy*1.5,
						self.rects[ii].originalWidth + self.vignetteDx*3, self.rects[ii].originalHeight + self.vignetteDy * 3);
	}
	
	self.clearControls = function() {
		var ctxt = graphics.getContext( graphics.controlsLayer );
		ctxt.clearRect(0,0,graphics.width,graphics.height);
		graphics.mark(0,0,graphics.width,graphics.height);
		self.showUpControl = false;
		self.showDownControl = false;
		self.showLeftControl = false;
		self.showRightControl = false;
		self.showZoomControls = false;
	}
	
	self.released = function(mouseX, mouseY, hasMouse) {
		
	}
	
	self.hover = function(mouseX, mouseY, hasMouse) {
		if (self.moving || !self.zoomed)
			return;
		
		var showZoomControls = false;
		var showUpControl = false;
		var showDownControl = false;
		var showLeftControl = false;
		var showRightControl = false;
		if ((mouseX < self.zoomed.x && mouseY < self.zoomed.y) || 
			(mouseX > self.zoomed.x + self.zoomed.width && mouseY < self.zoomed.y) ||
			(mouseX < self.zoomed.x && mouseY > self.zoomed.y + self.zoomed.height) ||
			(mouseX > self.zoomed.x + self.zoomed.width && mouseY > self.zoomed.y + self.zoomed.height)) {
				showZoomControls = true;
		} else {
			var gridX = self.zoomed.gridPos % 4;
			var gridY = Math.floor(self.zoomed.gridPos / 4);
			var gridPos = self.zoomed.gridPos;
			if (mouseX < self.zoomed.x && gridX>0)
				showLeftControl = true;
			
			if (mouseX > self.zoomed.x + self.zoomed.width && gridX<3)
				showRightControl = true;
			
			if (mouseY < self.zoomed.y && gridY>0)
				showUpControl = true;
				
			if (mouseY > self.zoomed.y + self.zoomed.height && gridY<3)
				showDownControl = true;
		}
		
		var ctxt = graphics.getContext( graphics.controlsLayer );
		ctxt.fillStyle = "rgba(256,256,256,0.6)";
		var x1 = self.zoomed.x + self.zoomed.width;
		var y1 = self.zoomed.y + self.zoomed.height;
		if (showZoomControls && !self.showZoomControls) {
			graphics.mark(0,0,graphics.width, graphics.height);
			ctxt.fillRect(0, 0, self.zoomed.x, self.zoomed.y);
			ctxt.fillRect(x1, 0, graphics.width - x1, self.zoomed.y);
			ctxt.fillRect(0, y1, self.zoomed.x, graphics.height - y1);
			ctxt.fillRect(x1, y1, graphics.width - x1, graphics.height - y1);
		} else if (self.showZoomControls && !showZoomControls) {
			graphics.mark(0,0,graphics.width, graphics.height);
			ctxt.clearRect(0, 0, self.zoomed.x, self.zoomed.y);
			ctxt.clearRect(x1, 0, graphics.width - x1, self.zoomed.y);
			ctxt.clearRect(0, y1, self.zoomed.x, graphics.height - y1);
			ctxt.clearRect(x1, y1, graphics.width - x1, graphics.height - y1);
		}
		self.showZoomControls = showZoomControls;
		
		if (showLeftControl && !self.showLeftControl) {
			graphics.mark(0, self.zoomed.y, self.zoomed.x, self.zoomed.height);
			ctxt.fillRect(0, self.zoomed.y, self.zoomed.x, self.zoomed.height);
		} else if (self.showLeftControl && !showLeftControl) {
			graphics.mark(0, self.zoomed.y, self.zoomed.x, self.zoomed.height);
			ctxt.clearRect(0, self.zoomed.y, self.zoomed.x, self.zoomed.height);
		}
		self.showLeftControl = showLeftControl;
	
		if (showRightControl && !self.showRightControl) {
			graphics.mark(x1, self.zoomed.y, graphics.width - x1, self.zoomed.height);
			ctxt.fillRect(x1, self.zoomed.y, graphics.width - x1, self.zoomed.height);
		} else if (self.showRightControl && !showRightControl) {
			graphics.mark(x1, self.zoomed.y, graphics.width - x1, self.zoomed.height);
			ctxt.clearRect(x1, self.zoomed.y, graphics.width - x1, self.zoomed.height);
		}
		self.showRightControl = showRightControl;
		
		if (showUpControl && !self.showUpControl) {
			graphics.mark(self.zoomed.x, 0, self.zoomed.width, self.zoomed.y);
			ctxt.fillRect(self.zoomed.x, 0, self.zoomed.width, self.zoomed.y);
		} else if (self.showUpControl && !showUpControl) {
			graphics.mark(self.zoomed.x, 0, self.zoomed.width, self.zoomed.y);
			ctxt.clearRect(self.zoomed.x, 0, self.zoomed.width, self.zoomed.y);
		}
		self.showUpControl = showUpControl;
		
		if (showDownControl && !self.showDownControl) {
			graphics.mark(self.zoomed.x, y1, self.zoomed.width, graphics.height - y1);
			ctxt.fillRect(self.zoomed.x, y1, self.zoomed.width, graphics.height - y1);
		} else if (self.showDownControl && !showDownControl) {
			graphics.mark(self.zoomed.x, y1, self.zoomed.width, graphics.height - y1);
			ctxt.clearRect(self.zoomed.x, y1, self.zoomed.width, graphics.height - y1);
		}
		self.showDownControl = showDownControl;
		
		graphics.redraw();
	}
	
	self.gotoView = function(vx, vy, vw, vh) {
		self.viewXDest = vx;
		self.viewYDest = vy;
		self.viewWidthDest = vw;
		self.viewHeightDest = vh;
		
		self.frame = 30;
		self.frameDelay = 15;
		self.viewXInc = ( self.viewXDest - self.viewX ) / self.frame;
		self.viewYInc = ( self.viewYDest - self.viewY ) / self.frame;
		self.viewWidthInc = ( self.viewWidthDest - self.viewWidth ) / self.frame;
		self.viewHeightInc = ( self.viewHeightDest - self.viewHeight ) / self.frame;
		self.moving = true;
		setTimeout(self.moveView, self.frameDelay);
	}
	
	self.moveView = function() {
		self.undraw();
		if (self.frame--) {
			self.setView( self.viewXDest - self.viewXInc * self.frame, self.viewYDest - self.viewYInc * self.frame, 
				self.viewWidthDest - self.viewWidthInc * self.frame, self.viewHeightDest - self.viewHeightInc * self.frame);
			setTimeout(self.moveView, self.frameDelay);
		} else {
			self.setView( self.viewXDest, self.viewYDest, self.viewWidthDest, self.viewHeightDest);
			self.moving = false;
		}
		self.draw();
	}
	
}
