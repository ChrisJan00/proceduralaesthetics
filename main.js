var graphics = new GraphicsManager();
var mouse = new MouseManager();

function prepareGame() {

	graphics.init();
	
	graphics.bgLayer = graphics.createLayer();
	graphics.shapesLayer = graphics.createLayer();
	
	prepareBackground();
	
	graphics.redraw();
	
	mouse.registerCanvas( graphics.gameCanvas );
	
	
}

function prepareBackground() {
	var ctxt = graphics.getContext(graphics.bgLayer);
	ctxt.fillStyle="#B5D5F5";
	ctxt.fillRect(0, 0, graphics.width, graphics.height);
	graphics.markAll();
}


function launchGame() {
	prepareGame();
	draw();
}

function draw() {
	var ctxt = graphics.getContext(graphics.shapesLayer);
	ctxt.fillStyle = "#FF8A8A";
	ctxt.fillRect(100,100,200,200);
	graphics.mark(100,100,200,200);
	graphics.redraw();
}

