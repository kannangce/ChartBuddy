var MULTIPLICATIONFACTOR=4;
var STANDARDWIDTH=30;
var GAPBETWEENBARS=20;
var FILLCOLORS=new Array("#884411","#441188","#118844","#5050E0");
var NUMBEROFRULERS=5;
var RULERCOLOR = "#E0E0E0";

/**
* Class containing the utilities to get the required chart.
*/
function ChartBuddy()
{
}
ChartBuddy.getBarChar=function(theData)
{
return new BarChart(theData).getSVGImage();
}

/**
* Class representing the Bar chart.
*/
function BarChart(theData)
{
	this.itsEntityArray = new Array();
	this.itsSVGImage;
	this.itsTotalCount=0;
	this.itsMaxUnits;
	this.itsHeight=100;
	aParsedJSON = JSON.parse(theData);
	aStartx = 10;
	for(aKey in aParsedJSON)
	{
	  var anEntity = new Bar(aKey,aParsedJSON[aKey],this,aStartx);
	  anEntity.setFillColour(FILLCOLORS[(this.itsEntityArray.length)%FILLCOLORS.length]);
	  this.itsEntityArray.push(anEntity);
	  this.itsTotalCount+=anEntity.itsUnits;
	  this.itsMaxUnits=this.itsMaxUnits>anEntity.itsUnits?this.itsMaxUnits:anEntity.itsUnits;
	  aStartx=aStartx+GAPBETWEENBARS+STANDARDWIDTH;
	}
}

/**
* This is what returns the whole SVG image that we see in the browser. This iterates through all the
* This returns below,
* - The SVG elements of the containing instances of the chart.
* - The other components of the chart such as the Vertical axis bar, Horizontal axis bar and the 
*    background horizontal bars that shows the divisions of the units.
*/
BarChart.prototype.getSVGImage=function()
{
 var aSVGElement = '<svg width='+(this.getBarChartWidth())+' height='+(this.getBarChartHeight())+'>';
 aSVGElement+=this.getBarGraphComponents();
 for(aBarIndex in this.itsEntityArray)
 {
   aSVGElement+=this.itsEntityArray[aBarIndex].getBarElementForSVG();
 }
 return aSVGElement+='</svg>'
}

/**
* Gets the width of the Bar chart image.
*/
BarChart.prototype.getBarChartWidth=function()
{
	return this.itsTotalCount*(STANDARDWIDTH+GAPBETWEENBARS);
}

/**
* Gets the height of the bar chart image.
*/
BarChart.prototype.getBarChartHeight=function()
{
	return (100*MULTIPLICATIONFACTOR)+50;
}

/**
* Returns the sum of units all the bars contained in this Bar Chart.
*/
BarChart.prototype.getTotalUnits=function()
{
  return this.itsTotalCount;
}

/**
* Gets the total height of the Bar chart represented by this instance.
*/
BarChart.prototype.getHeight=function()
{
 return this.itsHeight*MULTIPLICATIONFACTOR;
}	

/**
* Gets the Max units that will be represented by this Bar.
*/
BarChart.prototype.getMaxUnits=function()
{
 return this.itsMaxUnits;
}

/**
* Returns the Components to be used in the SVG. The components include,
* - SVG element for the X and Y axis.
* - SVG element for the background lines representing the division in the units.
*/
BarChart.prototype.getBarGraphComponents=function()
{
  var aComponentNodes = this.getYAxis();
  aComponentNodes+=this.getXAxis();
  aComponentNodes+=this.getRulers();
  return aComponentNodes;
}

/**
* Gets the Y-axis for the bar chart. For this vertical bar chart this is
* the axis that represents the unit.
*/
BarChart.prototype.getYAxis=function()
{
 var aYAxis = '<line x1=0 y1=0 x2=0 y2='+(100*MULTIPLICATIONFACTOR)+' style=\"stroke:rgb(255,0,0);stroke-width:2\"/>';
 return aYAxis;
}

/**
* Gets the X-Axis line of the Bar Chart. 
*/
BarChart.prototype.getXAxis=function()
{
 var aLengthOfXAxis=(this.itsEntityArray.length *(STANDARDWIDTH+GAPBETWEENBARS))+GAPBETWEENBARS;
 var aXAxis = '<line x1=0 y1='+(100*MULTIPLICATIONFACTOR)+' x2= '+ aLengthOfXAxis +' y2='+(100*MULTIPLICATIONFACTOR)+' style=\"stroke:rgb(255,0,0);stroke-width:2\"/>';
 return aXAxis;
}

/**
* Gets the rulers for the bar chart.
*/
BarChart.prototype.getRulers=function()
{
  var aRulerLineSVG = "";
  var atWidth = (100*MULTIPLICATIONFACTOR);
  var atHeight=0;
  for(var i=0;i<NUMBEROFRULERS;i++)
  {
	atHeight = (i*(100*MULTIPLICATIONFACTOR))/(NUMBEROFRULERS);
	aRulerLineSVG += "<line x1= " + 0 + " y1=" + atHeight + " x2=" + atWidth + " y2=" + atHeight +' style=\"stroke:'+RULERCOLOR+';stroke-width:2\"/>';
  }
  return aRulerLineSVG;
}

/**
* Class representing each Bar in the chart.
*/
function Bar(theName,theUnits,theOwner,theX)
{
    this.itsName=theName;
	this.itsUnits=theUnits;
	this.itsOwner=theOwner;
	this.itsX=theX;
}

/**
* Gets the percentage of unit of this instance based on the Max 
* units as defined in the BarChart instance, which contains this Bar.
*/
Bar.prototype.getPercentage=function()
{
 return (this.itsUnits/this.itsOwner.getMaxUnits())*100;
}

/**
* Gets the SVG <rect> element for the Bar represented by this instance.
*/
Bar.prototype.getBarElementForSVG=function()
{
 var aRectString;
 aRectString='<rect id="ChartBar" width=' + STANDARDWIDTH + ' height=' + this.getHeight() + ' x=' + this.itsX + ' y=' + this.getY() + ' style=\"fill:'+this.itsFillColor+'\">\n';
 aRectString+='<title>'+this.itsName +" - "+ this.itsUnits +'</title>';
 aRectString+='<animate attributeName=y from='+(100*MULTIPLICATIONFACTOR)+' to='+this.getY()+' begin=0s dur=1.5s/>\n';
 aRectString+='<animate attributeName=height to='+this.getHeight()+' from=0 begin=0s dur=1.5s/>\n';
 aRectString+='</rect>';
 return aRectString;
}

/**
* Gets the Y of the top-left of the bar represented by this instance.
*/
Bar.prototype.getY=function()
{
  // -1 ensures that the bars doesn't overlap with x-axis
  return this.itsOwner.getHeight()-this.getHeight()-1;
}

/**
* Gets the height of the bar represented by this instance.
*/
Bar.prototype.getHeight=function()
{
	return (this.getPercentage()*MULTIPLICATIONFACTOR);
}

/**
* Sets the colour of this Bar.
*/
Bar.prototype.setFillColour=function(theFillColour)
{
	this.itsFillColor=theFillColour;
}
