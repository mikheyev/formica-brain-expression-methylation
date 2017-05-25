////////////////////////////////////////////////////////////
//////////////////////// Set-up ////////////////////////////
////////////////////////////////////////////////////////////

var screenWidth = $(window).innerWidth(), 
	mobileScreen = (screenWidth > 500 ? false : true);

var margin = {left: 50, top: 10, right: 50, bottom: 10},
	width = Math.min(screenWidth, 800) - margin.left - margin.right,
	height = (mobileScreen ? 300 : Math.min(screenWidth, 800)*5/6) - margin.top - margin.bottom;
			
var svg = d3.select("#chart").append("svg")
			.attr("width", (width + margin.left + margin.right))
			.attr("height", (height + margin.top + margin.bottom));
			
var wrapper = svg.append("g").attr("class", "chordWrapper")
			.attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");;
			
var outerRadius = Math.min(width, height) / 2  - (mobileScreen ? 80 : 100),
	innerRadius = outerRadius * 0.95,
	opacityDefault = 0.7, //default opacity of chords
	opacityLow = 0; //hover opacity of those chords not hovered over
	
//How many pixels should the two halves be pulled apart
var pullOutSize = (mobileScreen? 20 : 50)

//////////////////////////////////////////////////////
//////////////////// Titles on top ///////////////////
//////////////////////////////////////////////////////

var titleWrapper = svg.append("g").attr("class", "chordTitleWrapper"),
	titleOffset = mobileScreen ? 15 : 40, 
	titleSeparate = mobileScreen ? 30 : 0;

//Title	top left
titleWrapper.append("text")
	.attr("class","title left")
	.style("font-size", mobileScreen ? "12px" : "16px" )
	.attr("x", (width/2 + margin.left - outerRadius - titleSeparate))
	.attr("y", titleOffset)
	.text("Expression");
titleWrapper.append("line")
	.attr("class","titleLine left")
	.attr("x1", (width/2 + margin.left - outerRadius - titleSeparate)*0.6)
	.attr("x2", (width/2 + margin.left - outerRadius - titleSeparate)*1.4)
	.attr("y1", titleOffset+8)
	.attr("y2", titleOffset+8);
//Title top right
titleWrapper.append("text")
	.attr("class","title right")
	.style("font-size", mobileScreen ? "12px" : "16px" )
	.attr("x", (width/2 + margin.left + outerRadius + titleSeparate))
	.attr("y", titleOffset)
	.text("Methylation");
titleWrapper.append("line")
	.attr("class","titleLine right")
	.attr("x1", (width/2 + margin.left - outerRadius - titleSeparate)*0.6 + 2*(outerRadius + titleSeparate))
	.attr("x2", (width/2 + margin.left - outerRadius - titleSeparate)*1.4 + 2*(outerRadius + titleSeparate))
	.attr("y1", titleOffset+8)
	.attr("y2", titleOffset+8);

////////////////////////////////////////////////////////////
/////////////////// Animated gradient //////////////////////
////////////////////////////////////////////////////////////

var defs = wrapper.append("defs");
var linearGradient = defs.append("linearGradient")
	.attr("id","animatedGradient")
	.attr("x1","0%")
	.attr("y1","0%")
	.attr("x2","100%")
	.attr("y2","0")
	.attr("spreadMethod", "reflect");

linearGradient.append("animate")
	.attr("attributeName","x1")
	.attr("values","0%;100%")
//	.attr("from","0%")
//	.attr("to","100%")
	.attr("dur","7s")
	.attr("repeatCount","indefinite");

linearGradient.append("animate")
	.attr("attributeName","x2")
	.attr("values","100%;200%")
//	.attr("from","100%")
//	.attr("to","200%")
	.attr("dur","7s")
	.attr("repeatCount","indefinite");

linearGradient.append("stop")
	.attr("offset","5%")
	.attr("stop-color","#E8E8E8");
linearGradient.append("stop")
	.attr("offset","45%")
	.attr("stop-color","#A3A3A3");
linearGradient.append("stop")
	.attr("offset","55%")
	.attr("stop-color","#A3A3A3");
linearGradient.append("stop")
	.attr("offset","95%")
	.attr("stop-color","#E8E8E8");
	
////////////////////////////////////////////////////////////
////////////////////////// Data ////////////////////////////
////////////////////////////////////////////////////////////

var Names = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12","M13","M14","M15","M16","M17","M18","M19","","E1","E2","E3","E4","E5","E6","E7","E8","E9","E10","E11","E12","E13","E14",""];

var Caste = ["#d3d3d3","#1e90ff","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#ff3030","#d3d3d3","#d3d3d3","#d3d3d3","#ff3030","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#ff3030","","#1e90ff","#1e90ff","#1e90ff","#d3d3d3","#1e90ff","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#1e90ff","#d3d3d3","#d3d3d3","#ff3030","#ff3030",""];

var Stage = ["#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","#d3d3d3","","#1e90ff","#1e90ff","#1e90ff","#1e90ff","#1e90ff","#1e90ff","#1e90ff","#1e90ff","#ff3030","#d3d3d3","#ff3030","#ff3030","#ff3030","#d3d3d3",""];

var genes = 5445, //Total number of genes
	emptyPerc = 0.1, //What % of the circle should become empty
	emptyStroke = Math.round(genes*emptyPerc); 
var matrix = [
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,61,22,16,5,1,5,103,7,29,5,6,4,1,5,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,62,16,15,12,2,2,91,7,29,3,0,1,1,1,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,65,19,13,6,2,1,89,7,28,3,2,2,3,1,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,54,9,9,10,1,2,67,5,20,3,1,3,1,2,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,42,16,7,5,0,1,64,4,16,0,1,1,2,1,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,39,7,12,7,0,2,45,2,17,3,3,3,1,1,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,3,5,0,0,0,21,1,5,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,37,8,3,5,1,2,41,1,18,0,1,0,0,1,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,77,12,13,7,0,2,73,3,32,2,2,2,1,6,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,126,32,13,14,1,6,152,8,51,5,8,5,3,3,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,31,5,6,3,0,1,28,3,13,0,2,1,0,2,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,62,17,7,6,2,0,75,9,22,3,2,4,0,1,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,76,21,14,7,2,0,73,2,22,2,1,4,0,2,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,56,17,9,12,1,1,82,4,22,2,3,1,0,1,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,50,11,6,3,1,0,59,3,13,4,0,0,1,2,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,574,187,52,54,12,12,728,49,161,30,27,21,12,24,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,8,2,3,3,0,19,0,8,1,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,74,17,17,10,1,5,96,6,30,3,4,3,0,3,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,53,12,14,13,2,1,80,2,26,2,3,1,1,4,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,emptyStroke],
[61,62,65,54,42,39,13,37,77,126,31,62,76,56,50,574,13,74,53,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[22,16,19,9,16,7,3,8,12,32,5,17,21,17,11,187,8,17,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[16,15,13,9,7,12,5,3,13,13,6,7,14,9,6,52,2,17,14,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[5,12,6,10,5,7,0,5,7,14,3,6,7,12,3,54,3,10,13,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[1,2,2,1,0,0,0,1,0,1,0,2,2,1,1,12,3,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[5,2,1,2,1,2,0,2,2,6,1,0,0,1,0,12,0,5,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[103,91,89,67,64,45,21,41,73,152,28,75,73,82,59,728,19,96,80,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[7,7,7,5,4,2,1,1,3,8,3,9,2,4,3,49,0,6,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[29,29,28,20,16,17,5,18,32,51,13,22,22,22,13,161,8,30,26,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[5,3,3,3,0,3,0,0,2,5,0,3,2,2,4,30,1,3,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[6,0,2,1,1,3,0,1,2,8,2,2,1,3,0,27,0,4,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[4,1,2,3,1,3,0,0,2,5,1,4,4,1,0,21,0,3,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[1,1,3,1,2,1,0,0,1,3,0,0,0,0,1,12,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[5,1,1,2,1,1,0,1,6,3,2,1,2,1,2,24,0,3,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,emptyStroke,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];
//Calculate how far the Chord Diagram needs to be rotated clockwise to make the dummy
//invisible chord center vertically
var offset = (2 * Math.PI) * (emptyStroke/(genes + emptyStroke))/4;

//Custom sort function of the chords to keep them in the original order
function customSort(a,b) {
	return 1;
};

//Custom sort function of the chords to keep them in the original order
var chord = customChordLayout() //d3.layout.chord()//Custom sort function of the chords to keep them in the original order
	.padding(.02)
	.sortChords(d3.descending) //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
	.matrix(matrix);
	
var arc = d3.svg.arc()
	.innerRadius(innerRadius)
	.outerRadius(outerRadius)
	.startAngle(startAngle) //startAngle and endAngle now include the offset in degrees
	.endAngle(endAngle);

var path = stretchedChord()
	.radius(innerRadius)
	.startAngle(startAngle)
	.endAngle(endAngle)
	.pullOutSize(pullOutSize);

////////////////////////////////////////////////////////////
//////////////////// Draw outer Arcs ///////////////////////
////////////////////////////////////////////////////////////

var g = wrapper.selectAll("g.group")
	.data(chord.groups)
	.enter().append("g")
	.attr("class", "group")
	.on("mouseover", fade(opacityLow))
	.on("mouseout", fade(opacityDefault));

g.append("path")
	.style("stroke", function(d,i) { return (Names[i] === "" ? "none" : "#00A1DE"); })
	.style("fill", function(d,i) { return (Names[i] === "" ? "none" : Caste[i]); })
	.style("pointer-events", function(d,i) { return (Names[i] === "" ? "none" : "auto"); })
	.attr("d", arc)
	.attr("transform", function(d, i) { //Pull the two slices apart
				d.pullOutSize = pullOutSize * ( d.startAngle + 0.001 > Math.PI ? -1 : 1);
				return "translate(" + d.pullOutSize + ',' + 0 + ")";
	});

g.append("path")
	.style("stroke", function(d,i) { return (Names[i] === "" ? "none" : "#00A1DE"); })
	.style("fill", function(d,i) { return (Names[i] === "" ? "none" : Stage[i]); })
	.style("pointer-events", function(d,i) { return (Names[i] === "" ? "none" : "auto"); })
	.attr("d", arc)
	.attr("transform", function(d, i) { //Pull the two slices apart
				d.pullOutSize =  pullOutSize * ( d.startAngle + 0.001 > Math.PI ? -1 : 1);
				return "scale(1.06) translate(" + d.pullOutSize*.96 + ',' + 0 + ")"
				});



////////////////////////////////////////////////////////////
////////////////////// Append Names ////////////////////////
////////////////////////////////////////////////////////////

//The text also needs to be displaced in the horizontal directions
//And also rotated with the offset in the clockwise direction
g.append("text")
	.each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2) + offset;})
	.attr("dy", ".35em")
	.attr("class", "titles")
	.attr("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
	.attr("transform", function(d,i) { 
		var c = arc.centroid(d);
		return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
		+ "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		+ "translate(" + 25 + ",0)"
		+ (d.angle > Math.PI ? "rotate(180)" : "")
	})
  .text(function(d,i) { return Names[i]; });

////////////////////////////////////////////////////////////
//////////////////// Draw inner chords /////////////////////
////////////////////////////////////////////////////////////
 
wrapper.selectAll("path.chord")
	.data(chord.chords)
	.enter().append("path")
	.attr("class", "chord")
	.style("stroke", "none")
	.style("fill", function(d,i) { return ((Names[d.target.index] === "E6") || (Names[d.target.index] === "E9") ? "#ffc125" : "url(#animatedGradient)");}) //An SVG Gradient to give the impression of a flow from left to right, and highlight conserved modules
	.style("opacity", function(d) { return (Names[d.source.index] === "" ? 0 : opacityDefault); }) //Make the dummy strokes have a zero opacity (invisible)	
	.style("pointer-events", function(d,i) { return (Names[d.source.index] === "" ? "none" : "auto"); }) //Remove pointer events from dummy strokes
	.attr("d", path)
	.on("mouseover", fadeOnChord)
	.on("mouseout", fade(opacityDefault));	

////////////////////////////////////////////////////////////
///////////////////////// Tooltip //////////////////////////
////////////////////////////////////////////////////////////

//Arcs
g.append("title")	
	.text(function(d, i) {return Math.round(d.value) + " genes in " + Names[i];});
		
////////////////////////////////////////////////////////////
////////////////// Extra Functions /////////////////////////
////////////////////////////////////////////////////////////

//Include the offset in de start and end angle to rotate the Chord diagram clockwise
function startAngle(d) { return d.startAngle + offset; }
function endAngle(d) { return d.endAngle + offset; }

// Returns an event handler for fading a given chord group
function fade(opacity) {
  return function(d, i) {
	wrapper.selectAll("path.chord")
		.filter(function(d) { return d.source.index !== i && d.target.index !== i && Names[d.source.index] !== ""; })
		.transition()
		.style("opacity", opacity);
  };
}//fade

// Fade function when hovering over chord
function fadeOnChord(d) {
	var chosen = d;
	wrapper.selectAll("path.chord")
		.transition()
		.style("opacity", function(d) {
			return d.source.index === chosen.source.index && d.target.index === chosen.target.index ? opacityDefault : opacityLow;
		});
}//fadeOnChord

/*Taken from http://bl.ocks.org/mbostock/7555321
//Wraps SVG text*/
function wrapChord(text, width) {
  text.each(function() {
	var text = d3.select(this),
		words = text.text().split(/\s+/).reverse(),
		word,
		line = [],
		lineNumber = 0,
		lineHeight = 1.1, // ems
		y = 0,
		x = 0,
		dy = parseFloat(text.attr("dy")),
		tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

	while (word = words.pop()) {
	  line.push(word);
	  tspan.text(line.join(" "));
	  if (tspan.node().getComputedTextLength() > width) {
		line.pop();
		tspan.text(line.join(" "));
		line = [word];
		tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
	  }
	}
  });
}//wrapChord