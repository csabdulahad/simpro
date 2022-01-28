/*
*	(C) COPRYRIGHT RESERVED BY THE AUTHOR OF THIS SCRIPT
*	
*-------------------------------------------------------------------------------------------
*										SimPro                                             *
*-------------------------------------------------------------------------------------------
*
*	A Simple JavaScript library for Canvas based Circular Progress Bar. You can dynamically 
*	create & manage circular progress bars with variety simple methods & properties.
*
*	@author Abdul Ahad
*	@version 1.8
*	@date Wednesday, August 2, 2017 03:40 AM
*
*	Example :
*		var simPro = new SimPro("containerDivID", "canvasID", canvasSize);
*		simPro.setProgress(49.4);
*		
*		containerDivID - where you want your progressBar/canvas to be
*		canvasID       - Id for the canvas for later manipulation
*		canvasSize	   - size of the progressBar/canvas. Minimum size is 100px		
*
*	For complete licence and documentation, please refer to the given links below
*		Licence 	  :: http://abdulahad.tk/simPro/licence
*		Documentation :: http://abdulahad.tk/simPro/documentation
*
*/

var SimPro = function(containerId, canvasId, size = 300) {	

	this.developerMode = false;
	if (this.developerMode) console.log("initializing()");

	if (typeof(containerId) != "string") throw "SimPro() : IllegalArgument - containerId must be string";
	if (typeof(canvasId) != "string") throw "SimPro() : IllegalArgument - canvasId must be string";
	if (typeof(size) != "number") throw "SimPro() : IllegalArgument - size must be number";
	if (size < 100) throw "SimPro() : IllegalArgument - size must be greater than 99";

	var container = document.getElementById(containerId);
	if (container == null) throw "SimPro() : NullArgument - progress bar container can't be null";

	SimPro.STYLE_LINE_BUTT 	= 0;
	SimPro.STYLE_LINE_ROUND = 1;
	
	//	create canvas with provided arguments and appeand to the container/holder div
	var canvas = document.createElement("canvas");
	canvas.id = canvasId;
	canvas.width = canvas.height = size;
	container.appendChild(canvas);

	this.canvasId = canvasId;
	this.context = canvas.getContext("2d");

	this.smallGuide = false;
	
	// the original width & height of the canvas
	this.size = size;

	// the half size of the canvas
	this.halfSize;
	
	/*
	*	line width for circular progress bar. 
	*	For small guide it should be 6% of the size. For big guide be it would be 3% of the size
	*/
	this.lineWidth;

	/*
	*	line width for guide. 
	*	For small guide it should be 3% of the size. For big guide be it would be 6% of the size
	*/
	this.guideLineWidth;

	// font size for percentage. This should be half of the halfSize meaning quater to the sizes
	this.fontSize;

	/*	
	*	the radius of the circular progress bar. This should be half of the the canvas
	* 	we need to calculate this in such a way that, with lineWidth of the arc for the progress 
	*	doesn't get cut off by the size of the canvas
	*/
	this.radius;
	
	// with all those critical properties decleared above, let's calculate them correctly
	this.calculateCanvasDimension();

	this.progress = 0;
	this.formattedProgress = "00";
	this.counterClock = true;

	this.startPoint = 1.5 * Math.PI;
	this.fullPoint = 2 * Math.PI;
	this.calculateProgress();

	//	default styles of the progress bar
	this.lineCap = SimPro.STYLE_LINE_BUTT;
	this.fontColor = "rgba(0,0,0,1)";
	this.color = "rgba(0,99,177, 1)";
	this.guideColor = "rgba(0,99,177, 0.5)";

	this.guideVisibility = true;
	this.floatMode = false;
	this.percentageSignVisibility = true;

	// after initializing all the properties, let's paint the progressBar with 0 progress
	this.paint();
};

SimPro.prototype.calculateCanvasDimension = function() {

	if (this.developerMode) console.log("calculateCanvasDimension()");

	this.halfSize = this.size / 2;

	this.fontSize = this.halfSize / 2;
	this.context.font = this.fontSize + "px Calibri";

	this.calculateArcDimension();
}

SimPro.prototype.calculateArcDimension = function() {
	
	if (this.developerMode) console.log("calculateArcDimension()");

	var unitSize = this.size / 100;
	
	var lineWidthScale = (this.smallGuide) ? 6 : 3;
	var guideScale = (this.smallGuide) ? 3 : 6;

	this.guideLineWidth = unitSize * guideScale;
 	this.lineWidth = unitSize * lineWidthScale; 

	// we calculate radius such a way, so the arc does not get cut off by the dimensions
	var radiusScale = (this.smallGuide) ? this.lineWidth : this.guideLineWidth;
	this.radius = this.halfSize - (radiusScale / 2);
};

SimPro.prototype.setSize = function(size) {

	if (this.developerMode) console.log("setSize(" + size + ")");

	if (typeof(size) != "number") throw "setSize() : IllegalArgument - argument must be a number";

	if (size < 100) throw "setSize() : IllegalArgument - argument must be greater than 99";

	// clear the old size canvas
	this.context.clearRect(0, 0, this.size, this.size);

	// let's first change the in memory canvas object
	var canvas = document.getElementById(this.canvasId);
	canvas.width = canvas.height = size;

	this.size = size;

	// since we have changed the size, then we need to calculate new dimesion based on new size
	this.calculateCanvasDimension();

	// paint so the changes will be visible instantly
	this.paint();
};


SimPro.prototype.calculateProgress = function() {
	
	if (this.developerMode) console.log("calculateProgress()");

	this.endPoint = (this.fullPoint / 100) * this.progress;
	this.endPointSigned = this.counterClock ? (- this.endPoint + this.startPoint) : (this.endPoint +this.startPoint);	
};

SimPro.prototype.formatProgress = function() {

	if (this.developerMode) console.log("formatProgress()");

	/*
	*	since with progress 0%, lineStyle round draws the arc, even though it should not because
	*	the progress is 0%. Let's fix that
	*/
	if (this.lineCap == SimPro.STYLE_LINE_ROUND && this.progress <= 0) {
		this.context.lineCap = "butt";
	} else {
		this.context.lineCap = (this.lineCap == SimPro.STYLE_LINE_BUTT) ?  "butt" :  "round";
	}

	if (this.floatMode) {
		/*
		*	because of JavaScript number representation, the fraction number should be
		*	fixed to one number after the decimal point
		*/
		this.formattedProgress = this.progress.toFixed(1);
		
		if (this.formattedProgress == 100) this.formattedProgress = 100;
	} else {
		
		this.formattedProgress = this.progress.toFixed(0);
		
		/*
		*	In order to be precise, when the progress is below 99, we use Math.floor function, so that
		*	progress makes sense. For example 67.4 is actually 67% progress.
		*	
		*	When the progress is above 99, we use Math.round function to obtain accuracy. For example if
		*	progress is 99.4 then it should be 99. But if the progress is 99.5 then it is 100% progress
		*/
		this.formattedProgress = (this.formattedProgress < 99) ? Math.floor(this.formattedProgress) : Math.round(this.formattedProgress);
		
		this.formattedProgress = (this.formattedProgress < 10) ? ("0" + this.formattedProgress) : this.formattedProgress;
	}

	this.formattedProgress += this.percentageSignVisibility ? "%" : "";
};


SimPro.prototype.setProgress = function(progress) {
	
	if (this.developerMode) console.log("setProgress(" + progress + ")");

	if (typeof(progress) != "number" ) throw "setProgress() : IllegalArgument - argument must be a number";

	if (progress > 100 || progress < 0) throw "setProgress() : IllegalArgument - argument must be between 0 - 100";

	this.progress = progress;
	this.calculateProgress();
	this.paint();
};

SimPro.prototype.getProgress = function() {

	//	we return progress based on floatMode
	var progressValue = (this.floatMode) ? this.progress.toFixed(1) : this.progress.toFixed(0);
	
	if (this.developerMode) console.log("getProgress() : " + progressValue);
	
	return progressValue;
};

SimPro.prototype.paint = function() {

	if (this.developerMode) console.log("paint()");

	/*
	*	before painting progress, first format progress string & adjust lineCap for 
	*	progress 0% if lineCap was choose to be Round
	*/
	this.formatProgress();

	this.context.clearRect(0, 0, this.size, this.size);

	if (this.developerMode)	this.paintRuler();

	// paint the guide arc
	if (this.guideVisibility) {
		this.context.beginPath();
		this.context.lineWidth = this.guideLineWidth;
		this.context.strokeStyle = this.guideColor;
		this.context.arc(this.halfSize, this.halfSize, this.radius, 0, this.fullPoint);
		this.context.stroke();
	}
	
	// paint the progress arc
	this.context.beginPath();
	this.context.lineWidth = this.lineWidth;
	this.context.strokeStyle = this.color;
	this.context.arc(this.halfSize, this.halfSize, this.radius, this.startPoint, this.endPointSigned, this.counterClock);
	this.context.stroke();


	// paint the text
	this.context.fillStyle = this.fontColor;
	this.context.textAlign = "center";
	this.context.textBaseline = "middle";
	this.context.fillText(this.formattedProgress, this.halfSize, this.halfSize);
};	

SimPro.prototype.setLineCap = function(lineCap) {

	if (this.developerMode) console.log("setLineCap(" + lineCap + ")");

	if ((lineCap != SimPro.STYLE_LINE_ROUND) && (lineCap != SimPro.STYLE_LINE_BUTT)) 
		throw "setLineCap() : IllegalArgument - argument must be constant of \"SimPro.STYLE_LINE_BUTT\" or \"SimPro.STYLE_LINE_ROUND\"";

	this.lineCap = lineCap;
	this.paint();
};
	
SimPro.prototype.setFloatMode = function (floatMode) {

	if (this.developerMode) console.log("setFloatMode(" + floatMode + ")");

	if (typeof(floatMode) != "boolean" ) throw "setFloatMode() : IllegalArgument - Argument must be true/false";

	this.floatMode = floatMode;
	this.paint();
}

SimPro.prototype.setSmallGuide = function(smallGuide) {
	
	if (this.developerMode) console.log("setSmallGuide(" + smallGuide + ")");

	if (typeof(smallGuide) != "boolean" ) throw "setSmallGuide() : IllegalArgument - Argument must be true/false";
	
	this.smallGuide = smallGuide;
	this.calculateArcDimension();
	this.paint();
};	
	
SimPro.prototype.setPercentageSignVisibility = function(visibility) {

	if (this.developerMode) console.log("setPercentageSignVisibility(" + visibility + ")");
	
	if (typeof(visibility) != "boolean" ) throw "setPercentageSignVisibility() : IllegalArgument - Argument must be true/false";

	this.percentageSignVisibility = visibility;
	this.paint();
};

SimPro.prototype.setCounterClock = function(counterClock) {
	
	if (this.developerMode) console.log("setCounterClock(" + counterClock + ")");
	
	if (typeof(counterClock) != "boolean" ) throw "setCounterClock() : IllegalArgument - Argument must be true/false";

	this.counterClock = counterClock;
	this.calculateProgress();
	this.paint();
};

SimPro.prototype.setFontColor = function(color) {
	
	if (this.developerMode) console.log("setFontColor(" + color + ")");

	if (typeof(color) != "string" ) throw "setFontColor() : IllegalArgument - Argument must be a valid color string";
	
	this.fontColor = color;
	this.paint();
};

SimPro.prototype.setProgressBarColor = function(color) {
	
	if (this.developerMode) console.log("setProgressBarColor(" + color + ")");

	if (typeof(color) != "string" ) throw "setProgressBarColor() : IllegalArgument - Argument must be a valid color string";

	this.color = color;
	this.paint();
};

SimPro.prototype.setGuideColor = function(color) {
	
	if (this.developerMode) console.log("setGuideColor(" + color + ")");

	if (typeof(color) != "string" ) throw "setGuideColor() : IllegalArgument - Argument must be a valid color string";

	this.guideColor = color;
	this.paint();
};

SimPro.prototype.setGuideVisibility = function(visibility) {
	
	if (this.developerMode) console.log("setGuideVisibility(" + visibility + ")");
	
	if (typeof(visibility) != "boolean" ) throw "setGuideVisibility() : IllegalArgument - Argument must be true/false";

	this.guideVisibility = visibility;
	this.paint();
};

SimPro.prototype.setDeveloperMode = function(mode) {

	if (typeof(mode) != "boolean" ) throw "setDeveloperMode() : IllegalArgument - Argument must be true/false";
	
	this.developerMode = mode;

	if (this.developerMode) console.log("turnOnDeveloperMode(" + mode + ")");

	this.paintRuler();
};

SimPro.prototype.paintRuler = function() {
	
	console.log("paintRuler()");

	this.context.strokeStyle = "greenyellow";
	this.context.lineWidth = 1;

	this.context.beginPath();
	this.context.lineTo(0, this.halfSize);
	this.context.lineTo(this.size, this.halfSize);
	this.context.stroke();

	this.context.beginPath();
	this.context.lineTo(this.halfSize, 0);
	this.context.lineTo(this.halfSize, this.size);
	this.context.stroke();

	this.context.strokeRect(0, 0, this.size - 1, this.size - 1);
	this.context.stroke();

	console.log("");
};
