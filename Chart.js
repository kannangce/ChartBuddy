var STANDARDWIDTH=30;
var GAPBETWEENBARS=20;
var FILLCOLORS=new Array("#884411","#441188","#118844","#5050E0");
var NUMBEROFRULERS=5;
var RULERCOLOR = "#E0E0E0";
var MARGIN = 50;

/**
* Class containing the utilities to get the required chart.
*/
function ChartBuddy()
{
}
ChartBuddy.getBarChar=function(theData,h,w)
{
return getBarChar(theData,h,w,false);
}
ChartBuddy.getBarChar=function(theData,h,w,isHor)
{
return new BarChart(theData,h,w,isHor).getSVGImage();
}

/**
* Class representing the Bar chart.
*/
function BarChart(theData,h,w,hor)
{
	this.itsEntityArray = new Array();
	this.itsMaxUnits;
	this.isHor = hor;
	var aParsedJSON = JSON.parse(theData);
	var n = 0;
	for(aKey in aParsedJSON)
	{
		n++;
	}
	var s = 0;
	var start = 0;
	if(!hor) {
		s = w/(n+0.7);
	} else {
		s = h/(n+0.7);
	}
	start = 0.2*s;
	STANDARDWIDTH = 0.6*s;
	GAPBETWEENBARS = 0.4*s;
	MARGIN = 0.5*s;
	this.itsHeight=h-MARGIN;
	this.itsWidth=w-MARGIN;
	var coOrd = 0;
	if(hor) {
		start = h - start -(GAPBETWEENBARS+STANDARDWIDTH);
	}
	for(aKey in aParsedJSON)
	{
	  var anEntity = new Bar(aKey,aParsedJSON[aKey],this,start,hor);
	  anEntity.setFillColour(FILLCOLORS[(this.itsEntityArray.length)%FILLCOLORS.length]);
	  this.itsEntityArray.push(anEntity);
	  this.itsMaxUnits=this.itsMaxUnits>anEntity.itsUnits?this.itsMaxUnits:anEntity.itsUnits;
	  if(!hor) {
		start+=(GAPBETWEENBARS+STANDARDWIDTH);
	  } else {
		start-=(GAPBETWEENBARS+STANDARDWIDTH);
	  }
	}
}

/**
* This is what returns the whole SVG image that we see in the browser. This iterates through all the
* This returns 3 things,
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
	return this.getWidth()+MARGIN;
}

/**
* Gets the height of the bar chart image.
*/
BarChart.prototype.getBarChartHeight=function()
{
	return this.getHeight()+MARGIN;
}

/**
* Gets the total height of the Bar chart represented by this instance.
*/
BarChart.prototype.getHeight=function()
{
 return this.itsHeight;
}

/**
* Gets the total width of the Bar chart represented by this instance.
*/
BarChart.prototype.getWidth=function()
{
 return this.itsWidth;
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
  if(!this.isHor) {
	aComponentNodes+=this.getRulers();
  }
  return aComponentNodes;
}

/**
* Gets the Y-axis for the bar chart. For this vertical bar chart this is
* the axis that represents the unit.
*/
BarChart.prototype.getYAxis=function()
{
 var aYAxis = '<line x1=0 y1=0 x2=0 y2='+this.getHeight()+' style=\"stroke:rgb(255,0,0);stroke-width:2\"/>';
 return aYAxis;
}

/**
* Gets the X-Axis line of the Bar Chart. 
*/
BarChart.prototype.getXAxis=function()
{
 var aXAxis = '<line x1=0 y1='+this.getHeight()+' x2= '+ this.getWidth() +' y2='+this.getHeight()+' style=\"stroke:rgb(255,0,0);stroke-width:2\"/>';
 return aXAxis;
}

/**
* Gets the rulers for the bar chart.
*/
BarChart.prototype.getRulers=function()
{
  var aRulerLineSVG = "";
  var atWidth = this.getWidth();
  var atHeight=0;
  for(var i=0;i<NUMBEROFRULERS;i++)
  {
	atHeight = (i*this.getHeight())/(NUMBEROFRULERS);
	aRulerLineSVG += "<line x1= " + 0 + " y1=" + atHeight + " x2=" + atWidth + " y2=" + atHeight +' style=\"stroke:'+RULERCOLOR+';stroke-width:2\"/>';
  }
  return aRulerLineSVG;
}

/**
* Class representing each Bar in the chart.
*/
function Bar(theName,theUnits,theOwner,coOrd,hor)
{
	this.isHor=hor;
    this.itsName=theName;
	this.itsUnits=theUnits;
	this.itsOwner=theOwner;
	this.coOrdinate=coOrd;
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
 aRectString='<rect width=' + this.getWidth() + ' height=' + this.getHeight() + ' x=' + this.getX() + ' y=' + this.getY() + ' style=\"fill:'+this.itsFillColor+'\">\n';
 aRectString+='<title>'+this.itsName +" - "+ this.itsUnits +'</title>';
 if(!this.isHor) {
	 aRectString+='<animate attributeName=y from='+this.itsOwner.getHeight()+' to='+this.getY()+' begin=0s dur=1.5s/>\n';
	 aRectString+='<animate attributeName=height from='+0+' to='+this.getHeight()+' begin=0s dur=1.5s/>\n';
 } else {
	 aRectString+='<animate attributeName=width from='+0+' to='+this.getWidth()+' begin=0s dur=1.5s/>\n';
 }
 aRectString+='</rect>';
 return aRectString;
}

/**
* Gets the Y of the top-left of the bar represented by this instance.
*/
Bar.prototype.getY=function()
{
  if(!this.isHor) {
	return this.itsOwner.getHeight()-this.getHeight();
  } else {
	return this.coOrdinate;
  }
}

/**
* Gets the X of the top-left of the bar represented by this instance.
*/
Bar.prototype.getX=function()
{
  if(!this.isHor) {
	return this.coOrdinate;
  } else {
	return 0;
  }
}

/**
* Gets the height of the bar represented by this instance.
*/
Bar.prototype.getHeight=function()
{
	if(!this.isHor) {
		return (this.getPercentage()*this.itsOwner.getHeight()/100);
	} else {
		return STANDARDWIDTH;
	}
}

/**
* Gets the width of the bar represented by this instance.
*/
Bar.prototype.getWidth=function()
{
	if(!this.isHor) {
		return STANDARDWIDTH;
	} else {
		return (this.getPercentage()*this.itsOwner.getWidth()/100);
	}
}

/**
* Sets the colour of this Bar.
*/
Bar.prototype.setFillColour=function(theFillColour)
{
	this.itsFillColor=theFillColour;
}
