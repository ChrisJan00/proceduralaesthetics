var GraphicsManager = function() {
	var self = this;
	
	self.init = function() {
		self.gameCanvas = document.getElementById("gameCanvas");
		self.gameContext = self.gameCanvas.getContext("2d");
		self.width = self.gameCanvas.width;
		self.height = self.gameCanvas.height;
		
		self.layers = [];
		self.rect = false;
	}
	
	self.createLayer = function() {
		var newLayer = document.createElement("canvas");
		newLayer.width = self.width;
		newLayer.height = self.height;
		self.layers.push( newLayer );
		return newLayer;
	}
	
	self.getContext = function(layer) {
		return layer.getContext("2d");
	}
	
	self.mark = function(x,y,w,h) {
		if (!self.rect)
			self.rect = {
				x : x,
				y : y,
				width : w,
				height : h };
		else {
			var x1 = self.rect.x + self.rect.width;
			var y1 = self.rect.y + self.rect.height;
			self.rect.x = Math.min(x, self.rect.x);
			self.rect.y = Math.min(y, self.rect.y);
			self.rect.width = Math.max(x1, x+w) - self.rect.x;
			self.rect.height = Math.max(y1, y+h) - self.rect.y;
		}
			
		if (self.rect.x < 0) {
			self.rect.width = self.rect.width + self.rect.x;
			self.rect.x = 0;
		}
		if (self.rect.y < 0) {
			self.rect.height = self.rect.height + self.rect.y;
			self.rect.y = 0;
		}
		
		if (self.rect.x + self.rect.width > self.width)
			self.rect.width = self.width - self.rect.x;
		if (self.rect.y + self.rect.height > self.height)
			self.rect.height = self.height - self.rect.y;
	}
	
	self.markAll = function() {
		self.mark(0, 0, self.width, self.height);
	}
	
	self.redraw = function() {
		if (!self.rect)
			return;
		for (var ii=0; ii < self.layers.length; ii++)
			self.gameContext.drawImage(self.layers[ii], self.rect.x, self.rect.y, self.rect.width, self.rect.height, 
					self.rect.x, self.rect.y, self.rect.width, self.rect.height);
		self.rect = false;
	}
	
	self.clearBackground = function() {
		for (var ii=0; ii < self.layers.length; ii++)
			self.getContext(self.layers[ii]).clearRect(0, 0, self.width, self.height);
		self.bgContext.fillStyle = G.colors.white;
		self.bgContext.fillRect(0,0,self.width,self.height);
		self.mark(0,0, self.width, self.height);
	}
	
	self.resizeCanvas = function(newWidth, newHeight) {
		self.gameCanvas.width = newWidth;
		self.gameCanvas.height = newHeight;
		self.gameCanvas.style.width = newWidth;
		self.gameCanvas.style.height = newHeight;
		self.width = newWidth;
		self.height = newHeight;
		for (var ii=0; ii < self.layers.length; ii++) {
			self.layers[ii].width = newWidth;
			self.layers[ii].height = newHeight;
		}
		if (self.rect.x + self.rect.width > self.width)
			self.rect.width = self.width - self.rect.x;
		if (self.rect.y + self.rect.height > self.height)
			self.rect.height = self.height - self.rect.y;
	}
}