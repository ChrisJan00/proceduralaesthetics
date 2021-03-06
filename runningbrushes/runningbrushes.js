var isWebkit = navigator.userAgent.indexOf("AppleWebKit") > -1;

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var RunningBrushes = function() {
	var self = this;
	self.prepare = function() {
	
		self.canvas = document.getElementById("gameCanvas");
		self.ctxt = self.canvas.getContext("2d");

		// workaround for webkit antialias
		self.originalWidth = self.canvas.width;
		self.extraBorder = 0;
		if (isWebkit) {
			self.extraBorder = 10;
			self.canvas.width += self.extraBorder;
			self.canvas.style.width = self.canvas.width;
		}
	
		//self.canvas.addEventListener('mousedown', startRandomWalk, false);
		self.clean();
	
		self.agentCount = 15;
		self.agents = [];
	}
	
	self.initAgent = function()
	{
		var agent = {}
		agent.x = Math.random() * self.originalWidth;
		agent.y = Math.random() * self.originalWidth;
		agent.angle = Math.random() * Math.PI * 2;
		agent.speed = Math.random() * 20;
		agent.radius = Math.random() * 20 + 1;
		agent.red = Math.floor(Math.random() * 255);
		agent.green = Math.floor(Math.random() * 255);
		agent.blue = Math.floor(Math.random() * 255);
		
		agent.alpha = 0.01;
		
		return agent;
	}
	
	
	self.clean = function() {
		self.ctxt.globalCompositeOperation = 'source-over';
		self.ctxt.fillStyle="#B5D5F5";
		self.ctxt.fillRect(self.extraBorder, 0, self.originalWidth, self.canvas.height);
		self.ctxt.globalCompositeOperation = 'source-atop';
	}
	
	
	self.start = function() {
		self.prepare();
		self.startRandomWalk();
		self.iteration();
	}
	
	self.startRandomWalk = function() {
		self.clean();
		for (var i = 0; i<self.agentCount; i++)
			self.agents[i] = self.initAgent();
	}
	
	self.iteration = function() {
		window.requestAnimationFrame(self.iteration);
		for (var i=0; i<self.agentCount; i++) {
			self.move(self.agents[i]);
			self.update(self.agents[i]);
			self.draw(self.agents[i]);
		}
	}
	
	// random walk
	self.move = function(agent) {
		agent.x = agent.x + agent.speed * Math.cos(agent.angle);
		agent.y = agent.y + agent.speed * Math.sin(agent.angle);
		if (agent.x < self.extraBorder)
			agent.x += self.originalWidth;
		if (agent.x >= self.canvas.width)
			agent.x -= self.originalWidth;
		if (agent.y < 0)
			agent.y += self.canvas.height;
		if (agent.y >= self.canvas.height)
			agent.y -= self.canvas.height;
	}
	
	self.update = function(agent)
	{
		//agent.red = Math.floor(agent.red + self.changeVar(10)) % 255;
		//agent.blue = Math.floor(agent.blue + self.changeVar(10)) % 255;
		//agent.green = Math.floor(agent.green + self.changeVar(10)) % 255;
		
		agent.radius = Math.min( Math.max(0.5, agent.radius + self.changeVar(0.2)), 25);
		agent.speed = Math.min( Math.max(0.1, agent.speed + self.changeVar(0.2)), agent.radius*2);
		agent.angle = agent.angle + self.changeVar(Math.PI/36);
	}
	
	self.changeVar = function(lambda) 
	{
		return (Math.random()>=0.5?1:-1)*Math.log(1-Math.random())*lambda;
	}
	
	self.draw = function(agent) {
		self.ctxt.fillStyle = "rgba("+agent.red+","+agent.green+","+agent.blue+","+agent.alpha+")";
		
		// normal circle
		self.ctxt.beginPath();
		self.ctxt.arc(agent.x, agent.y, agent.radius, 0, Math.PI*2, true);
		self.ctxt.fill();
		
		// off-limits
		if (agent.x + agent.radius > self.canvas.width) {
			self.ctxt.beginPath();
			self.ctxt.arc(agent.x - self.originalWidth, agent.y, agent.radius, 0, Math.PI*2, true);
			self.ctxt.fill();
		}
		if (agent.x - agent.radius < self.extraBorder) {
			self.ctxt.beginPath();
			self.ctxt.arc(agent.x + self.originalWidth, agent.y, agent.radius, 0, Math.PI*2, true);
			self.ctxt.fill();
		}
		if (agent.y + agent.radius > self.canvas.height) {
			self.ctxt.beginPath();
			self.ctxt.arc(agent.x, agent.y - self.canvas.height, agent.radius, 0, Math.PI*2, true);
			self.ctxt.fill();
		}
		if (agent.y - agent.radius < 0) {
			self.ctxt.beginPath();
			self.ctxt.arc(agent.x, agent.y + self.canvas.height, agent.radius, 0, Math.PI*2, true);
			self.ctxt.fill();
		}
		// off-limits (diagonal)
		if (agent.x + agent.radius > self.canvas.width && agent.y + agent.radius > self.canvas.height) {
			self.ctxt.beginPath();
			self.ctxt.arc(agent.x - self.originalWidth, agent.y - self.canvas.height, agent.radius, 0, Math.PI*2, true);
			self.ctxt.fill();
		}
		if (agent.x + agent.radius > self.canvas.width && agent.y - agent.radius < 0) {
			self.ctxt.beginPath();
			self.ctxt.arc(agent.x - self.originalWidth, agent.y  + self.canvas.height, agent.radius, 0, Math.PI*2, true);
			self.ctxt.fill();
		}
		if (agent.x - agent.radius < self.extraBorder  && agent.y + agent.radius > self.canvas.height) {
			self.ctxt.beginPath();
			self.ctxt.arc(agent.x + self.originalWidth, agent.y - self.canvas.height, agent.radius, 0, Math.PI*2, true);
			self.ctxt.fill();
		}
		if (agent.x - agent.radius < self.extraBorder  && agent.y - agent.radius < 0) {
			self.ctxt.beginPath();
			self.ctxt.arc(agent.x + self.originalWidth, agent.y + self.canvas.height, agent.radius, 0, Math.PI*2, true);
			self.ctxt.fill();
		}
	}
}

var runningBrushes = new RunningBrushes();
