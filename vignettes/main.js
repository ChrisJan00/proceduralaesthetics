var graphics = new GraphicsManager();
var objectMouse = new ClickableObjectManager();
var mainScene = new SceneManager();

function prepareGame() {

	graphics.init();
	
	graphics.bgLayer = graphics.createLayer();
	graphics.shapesLayer = graphics.createLayer();
	graphics.controlsLayer = graphics.createLayer();
	
	prepareBackground();
	
	graphics.redraw();
	
	objectMouse.registerCanvas( graphics.gameCanvas );
	
	mainScene.init();
	objectMouse.registerObject( mainScene );
}

function prepareBackground() {
	var ctxt = graphics.getContext(graphics.bgLayer);
	ctxt.fillStyle="#262626";
	ctxt.fillRect(0, 0, graphics.width, graphics.height);
	graphics.markAll();
}


function launchGame() {
	prepareGame();
	mainScene.draw();
}

function colorSquare(oldColor) {
	if (oldColor == "#CC52AA")
		return "#234567";
	if (oldColor == "#234567")
		return "#43927D";
	if (oldColor == "#43927D")
		return "#CC52AA";
	// default
	return "#CC52AA";
}


