function prepareGame() {

	gameCanvas = document.getElementById("gameCanvas");
	gameContext = gameCanvas.getContext("2d");

	//gameCanvas.addEventListener('mousedown', startRandomWalk, false);
	clean();

	agentCount = 15;
	agents = [];
	
}

function initAgent()
{
	var agent = {}
	agent.x = Math.random() * gameCanvas.width;
	agent.y = Math.random() * gameCanvas.height;
	agent.angle = Math.random() * Math.PI * 2;
	agent.speed = Math.random() * 20;
	agent.radius = Math.random() * 20 + 1;
	agent.red = Math.floor(Math.random() * 255);
	agent.green = Math.floor(Math.random() * 255);
	agent.blue = Math.floor(Math.random() * 255);
	
	agent.alpha = 0.01;
	
	return agent;
}


function clean() {
	gameContext.globalCompositeOperation = 'source-over';
	gameContext.fillStyle="#B5D5F5";
	gameContext.fillRect(0, 0, gameCanvas.width, gameCanvas.height);
}


function runningBrushes() {
	prepareGame();
	startRandomWalk();
	setInterval(iteration, 10);
}

function startRandomWalk() {
	clean();
	for (var i = 0; i<agentCount; i++)
		agents[i] = initAgent();
}

function iteration() {
	for (var i=0; i<agentCount; i++) {
		move(agents[i]);
		update(agents[i]);
		draw(agents[i]);
	}
}


// random walk
function move(agent) {
	agent.x = agent.x + agent.speed * Math.cos(agent.angle);
	agent.y = agent.y + agent.speed * Math.sin(agent.angle);
	if (agent.x < 0)
		agent.x += gameCanvas.width;
	if (agent.x >= gameCanvas.width)
		agent.x -= gameCanvas.width;
	if (agent.y < 0)
		agent.y += gameCanvas.height;
	if (agent.y >= gameCanvas.height)
		agent.y -= gameCanvas.height;
}

function update(agent)
{
	//agent.red = Math.floor(agent.red + changeVar(10)) % 255;
	//agent.blue = Math.floor(agent.blue + changeVar(10)) % 255;
	//agent.green = Math.floor(agent.green + changeVar(10)) % 255;
	
	agent.radius = Math.min( Math.max(0.5, agent.radius + changeVar(0.2)), 25);
	agent.speed = Math.min( Math.max(0.1, agent.speed + changeVar(0.2)), agent.radius*2);
	agent.angle = agent.angle + changeVar(Math.PI/36);
}

function changeVar(lambda) 
{
	return (Math.random()>=0.5?1:-1)*Math.log(1-Math.random())*lambda;
}

function draw(agent) {
	gameContext.fillStyle = "rgba("+agent.red+","+agent.green+","+agent.blue+","+agent.alpha+")";
	gameContext.beginPath();
	gameContext.arc(agent.x, agent.y, agent.radius, 0, Math.PI*2, true);
	gameContext.fill();
}

