var CircleSquids = function() {
	var self = this;
	self.prepare = function() {
	
		self.canvas = document.getElementById("gameCanvas");
		self.ctxt = self.canvas.getContext("2d");
	
		//canvas.addEventListener('mousedown', startRandomWalk, false);
		
		
		//self.arcCount = Math.floor(Math.random() * 18)+2;
		self.arcCount = 5;
		self.arcRadius = 100;
		self.arcAngle = 3*Math.PI/4;
		self.arcCW = true;
		self.circleCount = 8;
		self.circleRelation = 0.65;
		self.ownRadius = 75;
		self.rotation = 0;//Math.PI*4/5;
		self.centerX = self.canvas.width / 2;
		self.centerY = self.canvas.height / 2;
		
		self.radialSpeed = 0.01;
		self.iterCount = 0;
		
		self.rebootParams();
	}
	
	self.rebootParams = function() {
		self.arcCount = Math.floor(Math.random() * 10)+2;
		self.arcRadius = Math.random()*100 + 50;
		self.arcAngle = Math.PI * (1/4 + Math.random()*6/8);
		self.arcCW = (Math.random() < 0.5);
		self.circleCount = 4 + Math.floor(Math.random()*10);
		self.circleRelation = Math.random()*0.6 + 0.3;
		self.ownRadius = 20 + Math.random() * 100;
		self.rotation = Math.random() * Math.PI * 2;
	}

	self.clean = function() {
		self.ctxt.clearRect(0,0, self.canvas.width, self.canvas.height);
		self.ctxt.fillStyle="#B5D5F5";
		self.ctxt.fillRect(0, 0, self.canvas.width, self.canvas.height);
	}

	self.start = function() {
		self.prepare();
		self.clean();
		self.draw();
		self.computeCircles();
		//setTimeout(self.iteration, 10);
		setInterval(self.iteration, 10);
	}

	self.draw = function() {
		self.ctxt.strokeStyle = "#ff5400";
		self.ctxt.beginPath();
		self.ctxt.arc(self.centerX, self.centerY, self.ownRadius, 0, Math.PI*2, true);
		self.ctxt.stroke();
	}
	
	self.computeCircles = function() {
		
		var halfAngle = Math.PI / self.arcCount;
		var maxRadius = self.ownRadius * Math.sin(halfAngle) / (1-Math.sin(halfAngle));
		
		for (var arcIndex = 0; arcIndex < self.arcCount; arcIndex++) {
			var arcRotation = self.rotation + (Math.PI*2/self.arcCount)*arcIndex;
			
			var firstRadius = (self.circleRelation - 1)/(Math.pow(self.circleRelation, self.circleCount)-1) * 
				self.arcRadius * self.arcAngle / 2;
			if (firstRadius > maxRadius)
				firstRadius = maxRadius;
			
			var contactX = self.ownRadius * Math.cos(arcRotation) + self.centerX;
			var contactY = -self.ownRadius * Math.sin(arcRotation) + self.centerY;
			var arcCenterX, arcCenterY;
			
			if (self.arcCW) {
				arcCenterX = contactX + self.arcRadius * Math.sin(arcRotation);
				arcCenterY = contactY + self.arcRadius * Math.cos(arcRotation);
			} else {
				arcCenterX = contactX - self.arcRadius * Math.sin(arcRotation);
				arcCenterY = contactY - self.arcRadius * Math.cos(arcRotation);
			}
			
			var innerRadius = firstRadius;
			var cumulatedAngle = 0;
			for (var circleIndex = 0; circleIndex < self.circleCount; circleIndex++) {
				// law of cosines used here
				var betaAngle = Math.acos(1 - innerRadius*innerRadius/(2*self.arcRadius*self.arcRadius));
				cumulatedAngle += betaAngle;
				var circleCenterX, circleCenterY;
				
				if (self.arcCW) {
					circleCenterX = arcCenterX - Math.sin(arcRotation - cumulatedAngle) * self.arcRadius;
					circleCenterY = arcCenterY - Math.cos(arcRotation - cumulatedAngle) * self.arcRadius;
				} else {
					circleCenterX = arcCenterX + Math.sin(cumulatedAngle + arcRotation) * self.arcRadius;
					circleCenterY = arcCenterY + Math.cos(cumulatedAngle + arcRotation) * self.arcRadius;
				}
				
				self.ctxt.beginPath();
				self.ctxt.arc(circleCenterX, circleCenterY, innerRadius*0.9, 0, Math.PI*2, true);
				self.ctxt.stroke();
				
				cumulatedAngle += betaAngle;
				innerRadius *= self.circleRelation;
			}
		}
	}
	
	self.iteration = function() {
		if (self.busy)
			return;
		self.busy = true;
		self.updateParams();
		self.clean();
		self.draw();
		self.computeCircles();
		self.busy = false;
//		setTimeout(self.iteration, 10);
	}
	
	self.changeVar = function(lambda) {
		return (Math.random()>=0.5?1:-1)*Math.log(1-Math.random())*lambda;
	}
	
	self.limit = function(value, min, max) {
		if (value < min)
			return min;
		if (value > max)
			return max;
		return value;
	}
	self.wrap = function(value, min, max) {
		while (value < min)
			value += (max-min);
		while (value > max)
			value -= (max-min);
		return value;
	}
	
	self.updateParams = function() {
		if (--self.iterCount<=0) { 
			self.iterCount = Math.random() * 1000 + 50;
			
			self.arcRadiusInc = (Math.random() * 2 - 1) * 0.1;
			self.arcAngleInc = (Math.random() * 2 - 1) * 0.01;
			self.circleRelationInc = (Math.random() * 2 - 1) * 0.001;
			self.ownRadiusInc = (Math.random() * 2 - 1) * 0.1;
			self.rotationInc = (Math.random() * 2 - 1) * 0.01;
		}
		
		self.arcRadius = self.limit(self.arcRadius + self.arcRadiusInc, 25, 250);
		if (self.arcRadius == 25 || self.arcRadius == 250) self.arcRadiusInc *= -1;
		self.arcAngle = self.limit(self.arcAngle + self.arcAngleInc, Math.PI/4, 3*Math.PI/4);
		if (self.arcAngle == Math.PI/4 || self.arcAngle == 3*Math.PI/4) self.arcAngleInc *= -1;
		self.circleRelation = self.limit(self.circleRelation + self.circleRelationInc, 0.20, 0.90);
		if (self.circleRelation == 0.2 || self.circleRelation == 0.9) self.circleRelationInc *= -1;
		self.ownRadius = self.limit(self.ownRadius + self.ownRadiusInc, 20, 120);
		if (self.ownRadius == 20 || self.ownRadius == 120) self.ownRadiusInc *= -1;
		self.rotation = self.wrap(self.rotation + self.rotationInc, 0, 2*Math.PI);
	}
}

var circleSquids = new CircleSquids();
