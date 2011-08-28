var Consumed = function() {
	var self = this;
	
	self.prepare = function() {
	
		self.canvas = document.getElementById("gameCanvas");
		self.ctxt = self.canvas.getContext("2d");
	
		self.simplex = new SimplexNoise();
		
		self.side = 20;
		self.x = self.canvas.width*5/11;
		self.y = self.canvas.height/4;
		self.z = 0;
		//canvas.addEventListener('mousedown', startRandomWalk, false);

	}
	
	self.clean = function() {
		self.ctxt.clearRect(0,0, self.canvas.width, self.canvas.height);
		self.ctxt.fillStyle="#000000";
		self.ctxt.fillRect(0, 0, self.canvas.width, self.canvas.height);
	}

	self.start = function() {
		self.prepare();
		self.clean();
		
		self.ctxt.fillStyle = "#6e0c9e";
		self.ctxt.fillRect(self.canvas.width*5/11, self.canvas.height/4, self.canvas.width/11, self.canvas.height/2);
		//self.iteration();
		//self.draw();
		//setTimeout(self.iteration, 10);
		//setInterval(self.iteration, 15);
	}

	self.draw = function() {
		var side = 1;
		for (var x = 0; x<self.canvas.width / side; x++)
			for (var y=0; y<self.canvas.height / side; y++) {
				var col = Math.floor((self.simplex.noise(x/self.canvas.width*10, y/self.canvas.height*10)+1)*128);
				self.ctxt.fillStyle="rgba(0,"+col+",0,1)"
				self.ctxt.fillRect(x*side, y*side, side, side);
			}
		
		self.busy = false;
		
	}
	
	self.Aiteration = function() {
		for (var xx = self.canvas.width*5/11; xx < self.canvas.width*6/11; xx++)
			for (var yy = self.canvas.height/4; yy < self.canvas.height*3/4; yy++) {
			
			// draw box
			var percent = (self.simplex.noise3d(xx/self.canvas.width*10, yy/self.canvas.height*10, self.z/self.canvas.width*10)+1) / 2;
			
			var red = Math.floor(percent*3 + 110);
			var green = Math.floor(percent*3 + 12);
			var blue = Math.floor(percent*3 + 158);
			self.ctxt.fillStyle = "rgba("+red+","+green+","+blue+",1)";
			
			self.ctxt.fillRect(xx, yy, 1, 1);

		}
		//self.draw();
		self.z++;
		if (self.z == self.canvas.width) {
			self.z = 0;
		}
		setTimeout(self.iteration, 0);
	}
	
	self.iteration = function() {
		for (var ii = 0; ii<self.canvas.width/11; ii++) {
			// draw box
			var percent = (self.simplex.noise3d(self.x/self.canvas.width*10, self.y/self.canvas.height*10, self.z/self.canvas.width*10)+1) / 2;
			//var col = Math.floor(*128);
			
			//var purpleArea = self.x>= self.canvas.width*5/11 && self.x<=self.canvas.width*6/11 && self.y >= self.canvas.height/4 && self.y<=self.canvas.height*3/4;

			//if (purpleArea) {
				// "#6e0c9e" 110, 12, 158
				var red = Math.floor(percent*13 + 110);
				var green = Math.floor(percent*13 + 12);
				var blue = Math.floor(percent*13 + 158);
				self.ctxt.fillStyle = "rgba("+red+","+green+","+blue+",1)";
			//} else {
			//	var col = Math.floor(percent*3+2);
			//	self.ctxt.fillStyle = "rgba("+col+","+col+","+col+",1)";
			//}
			self.ctxt.fillRect(self.x,self.y,1,1);
			
			// increase position
			self.x++;
			if (self.x >= self.canvas.width*6/11) {
				self.x = self.canvas.width*5/11;
				self.y++;
				if (self.y >= self.canvas.height*3/4) {
					self.y = self.canvas.height/4;
					self.z++;
					if (self.z >= self.canvas.width) {
						self.z = 0;
					}
				}
			}
		}
		//self.draw();
		
		setTimeout(self.iteration, 0);
	}
	
}

var consumed = new Consumed();
