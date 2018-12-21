const utils    = {};

var rootThree = Math.sqrt(3);//square root of three


utils.prefixInteger = function(num, length) {
 return (Array(length).join('0') + num).slice(-length);
}


utils.offsetToAxial = function(offsetPt) {
	offsetPt.x=(offsetPt.x-(Math.floor(offsetPt.y/2)));
	return offsetPt;
}

utils.axialToScreen = function(axialPoint,sideLength) {
	// var tileY = rootThree*sideLength*(axialPoint.x+(axialPoint.y/2));
	// var tileX = 3 * sideLength/2*axialPoint.y;

	var tileY = sideLength*axialPoint.y + sideLength*0.5 - axialPoint.y*lineWidth ;
	var tileX = sideLength*axialPoint.x + sideLength*0.5 - axialPoint.x*lineWidth ;
	// cc.log("tileX:",axialPoint.x,tileX)

	// return cc.v2(0,0);
	return cc.v2(tileX,tileY);
	// axialPoint.x=tileX;
	// axialPoint.y=tileY;
	// return axialPoint;
}

/*
 * screen point to axial coordinate conversion
 * */
utils.screenToAxial = function(screenPoint,sideLength)
{
	// cc.log("screenPoint:",screenPoint)
	// cc.log("sideLength:",sideLength)


	var axialPoint = cc.v2(0,0);
	var y = Math.abs(Math.round((screenPoint.y - sideLength*0.5) / sideLength ));
	var x = Math.abs(Math.round((screenPoint.x - sideLength*0.5) / sideLength ));

	// console.log("xxxxx",(screenPoint.x  + x*lineWidth) / sideLength)
	// console.log("y:",y)

	axialPoint.x = (Math.floor((screenPoint.x  + x*lineWidth) / sideLength ));
	axialPoint.y = (Math.floor((screenPoint.y  + y*lineWidth) / sideLength ));


	// cc.log("axialPoint:",axialPoint)


	return axialPoint;
}

/*
 * find the third value of the cubic coordinate with the logic that x+y+z=0
 * */
utils.calculateCubicZ = function(newAxialPoint)
{
	return -newAxialPoint.x-newAxialPoint.y;
}

/*
 * axial coordinate to offset coordinate conversion
 * */
utils.axialToOffset = function(axialPt){
	// axialPt.x=(axialPt.x+(Math.floor(axialPt.y/2)));
	return axialPt;
}

/*
 * find the neighbors as a list of axial points for the given axial coordinate
 * */
utils.getNeighbors = function(axialPoint){//assign 6 neighbors
	var neighbourPoint = cc.v2(0,0);
	
	var neighbors = [];

	neighbourPoint.x = axialPoint.x+1;//right
	neighbourPoint.y = axialPoint.y;
	neighbors.push(cc.v2(neighbourPoint.x,neighbourPoint.y));

	neighbourPoint.x=axialPoint.x-1;//left
	neighbourPoint.y=axialPoint.y;
	neighbors.push(cc.v2(neighbourPoint.x,neighbourPoint.y));

	neighbourPoint.x=axialPoint.x;//bottom
	neighbourPoint.y=axialPoint.y-1;
	neighbors.push(cc.v2(neighbourPoint.x,neighbourPoint.y));

	neighbourPoint.x=axialPoint.x;
	neighbourPoint.y=axialPoint.y+1;//top
	neighbors.push(cc.v2(neighbourPoint.x,neighbourPoint.y));

	return neighbors;
}

utils.getNeighborsOBJ = function(axialPoint){
	var neighbourPoint = cc.v2(0,0);
	
	var neighbors = {};

	neighbourPoint.x = axialPoint.x+1;//right
	neighbourPoint.y = axialPoint.y;
	neighbors.r = (cc.v2(neighbourPoint.x,neighbourPoint.y));

	neighbourPoint.x=axialPoint.x-1;//left
	neighbourPoint.y=axialPoint.y;
	neighbors.l = (cc.v2(neighbourPoint.x,neighbourPoint.y));

	neighbourPoint.x=axialPoint.x;//bottom
	neighbourPoint.y=axialPoint.y-1;
	neighbors.b = (cc.v2(neighbourPoint.x,neighbourPoint.y));

	neighbourPoint.x=axialPoint.x;
	neighbourPoint.y=axialPoint.y+1;//top
	neighbors.t = (cc.v2(neighbourPoint.x,neighbourPoint.y));

	return neighbors;
}

//是否相邻
utils.isNeighbors = function(axialPoint,axialPoint1){
	var neighbors = this.getNeighbors(axialPoint);

	var returnVal = false;
	for(var i = 0;i<neighbors.length;i++){
		if(neighbors[i].equals(axialPoint1)){
			returnVal = true;
		}
	}

	return returnVal;

}

/**
 *深度clone对象
 */
utils.cloneObj = function(obj) {
    var o = (obj && obj.constructor===Array) ? [] : {};
    for(var i in obj)
    {
        if(obj.hasOwnProperty(i))
        {
            if ( !obj[i] ) { o[i]=obj[i]; continue; }
            o[i] = (typeof obj[i] === "object") ? utils.cloneObj(obj[i]) : obj[i];
        }
    }
    return o;
};

//获取随机数
utils.GetRandomNum = function(minNum, maxNum) {

    switch(arguments.length){ 
        case 1: 
            return parseInt(Math.random()*minNum+1,10); 
        break; 
        case 2: 
            return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
        break; 
            default: 
                return 0; 
            break; 
    } 
};

utils.inArray = function (obj,arr) {

  var i = arr.length;
  while (i--) {
    if (parseInt(arr[i]) === parseInt(obj)) {
      return true;
    }
  }
  return false;
}

module.exports = utils;
