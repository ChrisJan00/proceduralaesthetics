var isWebkit = navigator.userAgent.indexOf("AppleWebKit") > -1;
var optionsMenu;

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

var colorModes = {
	uniform : 0,
	monochrome : 1,
	complementary : 2,
	analogous : 3,
	triadic : 4,
	split_complementary : 5,
	tetradic : 6,
	square : 7
}

var RunningBrushes = function() {
	var self = this;
	self.prepare = function() {
	
		self.canvas = document.getElementById("gameCanvas");
		self.ctxt = self.canvas.getContext("2d");
		
		optionsMenu = new OptionsMenu(document.getElementById("optionsCanvas"));
		optionsMenu.height = self.canvas.height;
		
		self.setVars();

		// workaround for webkit antialias
		self.originalWidth = self.canvas.width;
		self.extraBorder = 0;
		if (isWebkit) {
			self.extraBorder = 10;
			self.canvas.width += self.extraBorder;
			self.canvas.style.width = self.canvas.width;
		}
	
		//self.canvas.addEventListener('mousedown', startRandomWalk, false);
		
		self.agentCount = 15;
		self.alpha = 0.01;
		self.agents = [];
		self.clean();
	}
	
	self.setVars = function() 
	{
		self.minRadius = 0.5;
		self.maxRadius = 25;
		self.rateRadius = 0.2;
		self.minSpeed = 0.1;
		self.maxSpeed = 50;
		self.rateSpeed = 0.2;
		self.rateAngle = Math.PI/36;
		
		// colors
		self.colorMode = colorModes.uniform;
		self.saturationBase = 100;
		self.saturationSpread = 10;
		self.lightnessBase = 50;
		self.lightnessSpread = 40;
		self.hueBase = 120;
		self.hueSpread = 10;
		
		self.adjustSaturationBase();
		self.adjustLightnessBase();
	}
	
	self.initAgent = function()
	{
		var agent = {}
		agent.x = Math.random() * self.originalWidth;
		agent.y = Math.random() * self.originalWidth;
		agent.angle = Math.random() * Math.PI * 2;
		
		var radiusRange = Math.max(self.maxRadius-self.minRadius,0);
		var minRadius = Math.min(self.maxRadius, self.minRadius);
		agent.radius = Math.random() * radiusRange + minRadius;
		
		var actualMaxSpeed = Math.min(self.maxSpeed, agent.radius*2);
		var actualMinSpeed = Math.min(self.minSpeed, agent.radius*2);
		var speedRange = Math.max(actualMaxSpeed-actualMinSpeed, 0);
		var minSpeed = Math.min(actualMaxSpeed, actualMinSpeed);
		agent.speed = Math.random() * speedRange + minSpeed;
		
		self.chooseColor(agent);
		
		return agent;
	}
	
	self.chooseColor = function(agent) 
	{
		agent.hueRand = Math.random()-0.5;
		agent.lRand = Math.random();
		agent.sRand = Math.random();
		switch (self.colorMode) {
			case colorModes.uniform : {
				agent.hueVar = Math.random() * 360;
				break;
			}
			case colorModes.monochrome : {
				agent.hueVar = 0;
				break;
			}
			case colorModes.complementary : {
				agent.hueVar = (Math.random() < 0.5 ? 180 : 0);
				break;
			}
			case colorModes.analogous : {
				agent.hueVar =
					(Math.random() < 0.5 ? 0 :
					(Math.random() < 0.5 ? 45 : (-45) ));
				break;
			}
			case colorModes.triadic : {
				agent.hueVar =
					(Math.random() < 1/3 ? 0 :
					(Math.random() < 0.5 ? 120 : (-120) ));
				break;
			}
			case colorModes.split_complementary : {
				agent.hueVar =
					(Math.random() < 1/3 ? 0 :
					(Math.random() < 0.5 ? 180 + 22.5 : 180 - 22.5 ));
				break;
			}
			case colorModes.tetradic : {
				agent.hueVar =
					( Math.random() < 0.5 ? 0 : 180 ) +
					(Math.random() < 0.5 ? 22.5 : (-22.5));
				break;
			}
			case colorModes.square : {
				agent.hueVar =
					(Math.random() < 0.5 ? 0 : 180) +
					(Math.random() < 0.5 ? 0 : 90);
				break;
			}
		}
		
		self.adjustColor(agent);
	}
	
	self.adjustColor = function(agent) 
	{
		// wrap around	
		agent.hue = self.hueBase + agent.hueRand * self.hueSpread + agent.hueVar;
		if (agent.hue < 0)
			agent.hue += 360;
		if (agent.hue >= 360)
			agent.hue -= 360;
		agent.hue = Math.floor(agent.hue);
		
		agent.lightness = self.lightnessStart + agent.lRand * self.lightnessSpread;
		agent.saturation = self.saturationStart + agent.sRand * self.saturationSpread;
	}
	
	self.adjustLightnessBase = function( ) {
		var lb = self.lightnessBase;
		var ls = self.lightnessSpread;
		var lmin = lb - ls/2;
		if (lmin < 0)
			lmin = 0;
		if (lmin + ls > 100)
			lmin = 100 - ls;
		self.lightnessStart = lmin;
	}
	
	self.adjustSaturationBase = function( ) {
		var sb = self.saturationBase;
		var ss = self.saturationSpread;
		var smin = sb - ss/2;
		if (smin < 0)
			smin = 0;
		if (smin + ss > 100)
			smin = 100 - ss;
		self.saturationStart = smin;
	}
	
	self.restartAgents = function() {
		for (var i=0; i<self.agents.length; i++)
			self.agents[i] = self.initAgent();
	}
	
	self.restartAgentColors = function() {
		for (var i=0; i<self.agents.length; i++)
			self.chooseColor(self.agents[i]);
	}
	
	self.adjustAgentColors = function() {
		self.adjustLightnessBase();
		self.adjustSaturationBase();
		for (var i=0; i<self.agents.length; i++)
			self.adjustColor(self.agents[i]);
	}
	
	
	self.clean = function() {
		if (self.agents)
			self.restartAgents();
			
		self.ctxt.globalCompositeOperation = 'source-over';
		//self.ctxt.fillStyle="#B5D5F5";
		self.ctxt.fillStyle = "rgba("+self.bgRed+","+self.bgGreen+","+self.bgBlue+","+1+")";
		self.ctxt.fillRect(self.extraBorder, 0, self.originalWidth, self.canvas.height);
		self.ctxt.globalCompositeOperation = 'source-atop';
	}
	
	
	self.start = function() {
		self.prepare();
		self.startRandomWalk();
		self.active = true;
		self.iteration();
	}
	
	self.startRandomWalk = function() {
		self.clean();
		for (var i = 0; i<self.agentCount; i++)
			self.agents[i] = self.initAgent();
	}
	
	self.iteration = function() {
		if (self.active)
			window.requestAnimationFrame(self.iteration);
		for (var i=0; i<self.agentCount; i++) {
			self.move(self.agents[i]);
			self.update(self.agents[i]);
			self.draw(self.agents[i]);
		}
	}
	
	self.toggleActive = function() {
		if (self.active)
			self.active = false;
		else {
			self.active = true;
			self.iteration();
		}
	}
	self.adjustAgentcount = function(count) {
		if (count < 1)
			count = 1;
		if (count < self.agents.length) {
			self.agents.splice(count,self.agents.length-count);
			self.agentCount = self.agents.length;
			return;
		}
		if (count > self.agents.length) {
			for (var ii=self.agents.length;ii<count;ii++)
				self.agents.push(self.initAgent());
			self.agentCount = self.agents.length;
			return;
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
		
		agent.radius = Math.min( Math.max(self.minRadius, agent.radius + self.changeVar(self.rateRadius)), self.maxRadius);
		var actualMaxSpeed = Math.min(self.maxSpeed, agent.radius*2);
		var actualMinSpeed = Math.min(self.minSpeed, agent.radius*2);
		agent.speed = Math.min( Math.max(actualMinSpeed, agent.speed + self.changeVar(self.rateSpeed)), actualMaxSpeed);
		agent.angle = agent.angle + self.changeVar(self.rateAngle);
	}
	
	self.changeVar = function(lambda) 
	{
		return (Math.random()>=0.5?1:-1)*Math.log(1-Math.random())*lambda;
	}
	
	self.draw = function(agent) {
		//self.ctxt.fillStyle = "rgba("+agent.red+","+agent.green+","+agent.blue+","+self.alpha+")";
		self.ctxt.fillStyle = "hsla("+agent.hue+","+agent.saturation+"%,"+agent.lightness+"%,"+self.alpha+")";
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
	
	// screen control
	self.bgRed = 181;
	self.bgGreen = 213;
	self.bgBlue = 245;
	self.newWidth = 512;
	self.newHeight = 512;
	self.applyNewScreen = function() {
		function paddedHexStr(number) {
			var str = number.toString(16).substr(0,2);
			return "00".substr(0,2-str.length) + str;
		}
		self.originalWidth = self.newWidth;
		self.canvas.width = self.originalWidth + self.extraBorder;
		self.canvas.height = self.newHeight;
		self.canvas.style.width = self.canvas.width;
		self.canvas.style.height = self.newHeight;
		
		document.bgColor = "#"+paddedHexStr(self.bgRed)+paddedHexStr(self.bgGreen)+paddedHexStr(self.bgBlue);
		self.clean();
		optionsMenu.updateSize();
	}
}

var runningBrushes = new RunningBrushes();
