/*
  The radar for displaying visualization of zig data on browser window
  Displays a skeleton instead of a dot.
  
  This version has an "off screen" view, which makes any clipped skeleton joints visible.
  In other words, the view shown is "zoomed out" from the actual recording.

  Used for recording and replaying recorded kinect data.
  
  This is based on the radar example taken from the zigfu site example

  NOTE: Requires loaded prior: zig.js
  
  Updates:
  12/16 - coloring by all principles
  - Joints object maps joint names to integers
  - joint coloring functions take an array of scores as param isntead of individual values
  - resetSkeletonColor() resets skeleton color
  12/9 - made colorByScores global. changed to 3 params. TODO: CHANGE BACK TO 4
  12/8/2013 - color joints based on kungfu principle scoring
  Ver 2.0 - Has a "off screen" margin. The SVG shows a zoomed out view of the recording.

  Notes:
  http://stackoverflow.com/questions/8018442/jquery-create-empty-self-closed-tag
  http://www.w3.org/Graphics/SVG/IG/resources/svgprimer.html#examples
  http://api.jquery.com/append/
  Kinect Sensor Specs
  http://msdn.microsoft.com/en-us/library/jj131033.aspx
*/


var MAX_JOINTS = 20; // maximum number of joints
var MAX_BONES = 19; // maximum number of edges between joints
var FRAME_TIMEOUT = 33; // time in between frames, in milliseconds
var KINECT_WIDTH = 1280.0; // width of a kinect snapshot
var KINECT_HEIGHT = 960.0; // height of a kinect snapshot


// Percentage of the SVG block to use for screen view. The remainder will be for "off screen" view
var SCREEN_VIEW_PERCENT = 0.45; 

var radar; // listener that responds to zigfu

// function for coloring joints. Global so that other JS files can use
// FIXME: this is probably bad style
var colorByScores;

var frameCounter;
var userData;
var $svgBlock;
var radarBones;
var boneMap;
var radarJoints;
var jointMap;
var radarHead;
var resetSkeletonColor;
var resetJointColors;
var resetHeadColor;
var resetBoneColors;

// Joint numberings
var Joints = {
    "Head": 0,
    "Neck": 1,
    "ShoulderCenter": 2,
    "HipCenter": 3,
    "LeftShoulder": 4,
    "LeftElbow": 5,
    "LeftWrist": 6,
    "LeftHand": 7,
    "RightShoulder": 8,
    "RightElbow":9,
    "RightWrist": 10,
    "RightHand": 11,
    "LeftHip": 12,
    "LeftKnee": 13,
    "LeftAnkle": 14,
    "LeftFoot": 15,
    "RightHip": 16,
    "RightKnee": 17,
    "RightAnkle": 18,
    "RightFoot": 19
};

// execute when window done loading
function radarLoaded() {

    frameCounter = 0;
    userData = {}; // user's recorded data
    $svgBlock = $("#svg-block"); // jqueryfied svg block
    radarBones = setupBoneElements($svgBlock); // holds bone elements
    boneMap = setupBoneMap(); // used to identifying bone-joint connection
    radarJoints = setupJointElements($svgBlock); // holds joint elements
    jointMap = setupJointMap(); // used to identify position of joint
    radarHead = setupHeadElement($svgBlock); // represents head

    drawViewBounds($svgBlock); // draws a rectangle for the kinect view's bounds

    // The radar object will respond to events from the 
    // zig object and move the skeletons around accordingly.
    // It is also responsible for creating and destroying 
    // the skeletons when users are added and removed.
    // Functions onuserfound(), onuserlost(), and ondataupdate() 
    // are called by the zig object when those things happen.
    radar = {
	onuserfound: function (user) {
	},
	onuserlost: function (user) {
	},
	ondataupdate: function (zigdata) {
	    // Update radar skeleton upon zigfu data update
	    // takes zigfu format for data
	    // Called by Zigfu
	    if (!isReplaying) {
		for (var userid in zigdata.users) {
		    // Position the skeleton for the user's current frame
		    var frameData = zigdata.users[userid];
		    repositionJoints(frameData);
		} // for
	    }
	},
	onFrameUpdate: function (frameData) {
	    // Repositions the skeletons joints and limbs
	    // Takes 1 frame of motion data
	    // Called when replaying

	    // For each joint in the skeleton, reposition its graphical element
	    repositionJoints(frameData);
	}
    }; // radar
    
    
    /* Off screen mode viewing */
    /* 
       Draws a rectangle representing the bounds of kinect's field of view
       $param $container the jquery element for the SVG container
    */
    function drawViewBounds($container) {
        var svgWidth = $container.attr("width");
	var svgHeight = $container.attr("height");
        var rect, rectx, recty, rectWidth, rectHeight;
        
        rectx = svgWidth * (1 -  SCREEN_VIEW_PERCENT) / 2;
        recty = svgHeight * (1 - SCREEN_VIEW_PERCENT) / 2;
        rectWidth = svgWidth * SCREEN_VIEW_PERCENT;
        rectHeight = svgHeight * SCREEN_VIEW_PERCENT;
        
        rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	$container.append( rect );
	
	$( rect ).attr("x", rectx);
	$( rect ).attr("y", recty);
	$( rect ).attr("width", rectWidth);
	$( rect ).attr("height", rectHeight);
	$( rect ).attr("stroke", "#F0F0F0");
        $( rect ).attr("fill", "transparent");
        $( rect ).attr("stroke-width", 1);
        
    } // drawViewBounds
    
    /* Skeleton Stuff */

    /*
      Resets the color of the skeleton
      Joints are black, bones are blue, head is black
     */
    resetSkeletonColor = function() {
	resetJointColors(radarJoints);
	resetHeadColor(radarHead);
	resetBoneColors(radarBones);
    };
    /*
      Resets skeleton joint element colors to black
      @param jointEles array of jqueried elements
     */
    resetJointColors = function(jointEles) {
	for (var i = 0; i < jointEles.length; i++) {
	    jointEles[i].attr("fill", "black");
	}
    }; // resetJointColors
    /*
      Resets skeleton head element color to black
      @param headEle the jqueried element for skeleton head
     */
    resetHeadColor = function(headEle) {
	headEle.attr("fill", "black");
    }; 
    /*
      Resets skeleton bone element colors to blue
      @param boneEles array of jqueried elements representing bones
     */
    resetBoneColors = function(boneEles) {
	for (var i = 0; i < boneEles.length; i++) {
	    boneEles[i].attr("stroke", "blue");
	}
    };
    /*
      Causes the skeleton to change color based on principle scores
      A joint is colored red if any of its related principles are violated.
      Joints with no principle violation are colored black.
      @param scores array of principle scores, index ordered by PRINCIPLE order
    */
    colorByScores = function (scores) {
	// Color the joints based on principle scores
	colorJointsByScores(scores, radarJoints);
	// Color head based on principle scores
	colorHeadByScores(scores, radarHead);
	// Color the bones based on principle scores
	colorBonesByScores(scores, radarBones, boneMap);
    }; // colorByScores
    /*
      Color joints based on kungfu principle scores
      A joint is colored red if any of its related principles are violated.
      Joints with no principle violation are colored black.
      @param scores array of scores ordered by PRINCIPLE indexing
      @param jointEles array of joints as jquery elements
     */
    function colorJointsByScores (scores, jointEles) {
	for (var i = 0; i < jointEles.length; i++) {
	    if (jointIsViolated(i, scores)) {
		// Violated, color red
		jointEles[i].attr("fill", "red");
	    }
	    else {
		// Not violated, color black
		jointEles[i].attr("fill", "black");
	    }
	}
    } // color joints by scores

    /*
      Color head based on kungfu principle scores
      Head is colored red if any of its related principles are violated.
      Head with no principle violation is colored black.
      @param scores array of scores ordered by PRINCIPLES indexing
      @param headEle the jquery element representing skeleton head
     */
    function colorHeadByScores(scores, headEle) {
	if (jointIsViolated(0, scores)) { // 0 is index of head
	    // Violated, color red
	    headEle.attr("fill", "red");
	}
	else {
	    headEle.attr("fill", "black");
	}
    } // colorHeadByScore
    /*
      Color bones based on kungfu principle scores
      A bone is colored red if any of its related principles are violated.
      Bones with no principle violation are colored blue.
      @param scores array of scores ordered by PRINCIPLES ordering
      @param boneEles array of bones as jquery elements
      @param boneMap mapping of bones to joints
     */
    function colorBonesByScores (scores, boneEles, boneMap) {
	var jid1, jid2; // temporary joint ids
	var j1, j2; // temporary joint indices within their array container
	var b; // temporary bone object

	for (var i = 0; i < boneEles.length; i++) {
	    b = boneMap[i];
	    jid1 = b.jointId1; // id of first joint of bone
	    jid2 = b.jointId2; // id of second joint of bone
	    j1 = zigfuIdToJointIndex(jid1);
	    j2 = zigfuIdToJointIndex(jid2);
	    if (jointIsViolated(j1, scores)
	       || jointIsViolated(j2, scores)) {
		// Violated, color red
		boneEles[i].attr("stroke", "red");
	    }
	    else {
		// Not violated, color black
		boneEles[i].attr("stroke", "blue");
	    }
	}
    } // colorBonesByScores
    /*
      Return true if any principle score related to the joint is below threshold
      @param index the array index of the joint within radarJoints array
      @param scores array of principle scores ordered by PRINCIPLES indexing
    */
    function jointIsViolated(index, scores) {
	var prin = PRINCIPLES; // principle indices
	var thresholds = PRINCIPLE_THRESHOLD; // principle threshold values

	// Hip Initiation check
	// left/right hip, knee, ankle, foot 
	if ((index == Joints.LeftHip || index == Joints.LeftKnee
	     || index == Joints.LeftAnkle || index == Joints.LeftFoot
	     || index == Joints.RightHip || index == Joints.RightKnee
	     || index == Joints.RightAnkle || index == Joints.RightFoot)
	    && scores[prin.HipInitiation] <= thresholds.HipInitiation) {
	    // violated
	    return true;
	}
	// Spiral Transfer
	// spine(torso), shoulder center(neck), head, shoulder left and right
	if ((index == Joints.Spine || index == Joints.ShoulderCenter
	     || index === Joints.Head || index == Joints.LeftShoulder
	     || index == Joints.RightShoulder)
	    && scores[prin.SpiralTransfer] <= thresholds.SpiralTransfer) {
	    // violated
	    return true;
	}
	// Opposition Recoil
	// Spine, ShoulderCenter, RShoulder, LElbow, LWrist, LHand, LHip, LKnee, LAnkle, LFoot, RHip, RKnee, RAnkle, RFoot
	if ((index == Joints.Spine || index == Joints.ShoulderCenter
	    || index == Joints.ShoulderRight || index == Joints.LeftElbow
	    || index == Joints.LeftWrist || index == Joints.LeftHand
	    || index == Joints. LeftHip || index == Joints.LeftKnee
	    || index == Joints.LeftAnkle || index == Joints.LeftFoot
	    || index == Joints. RightHip || index == Joints.RightKnee
	    || index == Joints.RightAnkle || index == Joints.RightFoot)
	    && scores[prin.OppositionRecoil] <= thresholds.OppositionRecoil) {
	    // violated
	    return true;
	}
	// Wrist-Elbow-Shoulder Alignment
	// RightShoulder, RIghtElbow, Right Wrist, Right Hand
	if ((index == Joints.RightShoulder || index == Joints.RightElbow
	    || index == Joints.RightWrist || index == Joints.RightHand)
	    && scores[prin.WESAlignment] <= thresholds.WESAlignment) {
	    // violated
	    return true;
	}
	// Wrist Alignment with Chest
	// - Spine, Shoulder Center, Right Shoulder, RightElbow
	if ((index == Joints.Spine || index == Joints.ShoulderCenter
	    || index == Joints.RightShoulder || index == Joints.RightElbow)
	    && scores[prin.WristAlignmentWithChest] <= thresholds.WristAlignmentWithChest) {
	    // violated
	    return true;
	}
	// Shoulders Down
	// shoulders left/right
	if ((index == Joints.LeftShoulder || index == Joints.RightShoulder)
	    && scores[prin.ShouldersDown] <= thresholds.ShouldersDown) {
	    // violated
	    return true;
	}
	

	return false; // no violations
    } // jointIsViolated
    
    /*
      Repostions the joints using positions from a frame of data
      @param frameData a frame of kinect zigfu data
     */
    function repositionJoints(frameData) {
	// For each joint in the skeleton, reposition its DOM element
	for (var jointId in frameData.skeleton) {
	    var ithJoint = frameData.skeleton[jointId];
	    // Position a dot at each joint
	    var pos = ithJoint.position;
	    //var zrange = 4000;
	    //var xrange = 4000;
	    //var pixelwidth = $svgBlock.attr("width");
	    //var pixelheight = $svgBlock.attr("height");
	    //var heightscale = pixelheight / zrange;
	    //var widthscale = pixelwidth / xrange;
	    // Dimensions of the radar, which is an SVG block
	    var svgWidth = $svgBlock.attr("width");
	    var svgHeight = $svgBlock.attr("height");
	    // Position of joint, adjusted to correct user orientation
	    var x, y, xscale, yscale;
	    //x = svgWidth - (((pos[0] / xrange) + 0.5) * pixelwidth);
	    //y = svgHeight - ((pos[1] / zrange) * pixelheight);
	    // X and Y position values scaled to 1 (0.0 thru 1.0)
	    // Also shift so that negative positions have positive coords
	    xscale = pos[0] / KINECT_WIDTH + 0.5;
	    yscale = pos[1] / KINECT_HEIGHT + 0.5;
	    // Set x and y relative to svg dimensions
	    x = xscale * svgWidth - 0.5;
	    // Flip y b/c y value goes top-to-down on browser screen
	    y = svgHeight - (yscale * svgHeight - 0.5); 

	    // Scale and shift the positions for "off screen" viewing
        x *= SCREEN_VIEW_PERCENT;
        y *= SCREEN_VIEW_PERCENT;
        x += svgWidth * (1 - SCREEN_VIEW_PERCENT) / 2;
        y += svgHeight * (1 - SCREEN_VIEW_PERCENT) / 2;
	    
	    // Set the joint's position
	    updateJoint(jointMap, jointId, x, y);
	    
	} // for each joint in user data skeleton
	// Refresh the position of jquery elements
	refreshBoneElements(radarBones, boneMap, jointMap);
	refreshJointElements(radarJoints, jointMap);
	refreshHeadElement(radarHead, jointMap);
    } // reposition joints

    /*
      Sets up the elements representing the joints
      @param $container jquery element to use as container for joint elements
      @return array containing references to the joints as jquery elements
     */
    function setupJointElements($container) {
	var arr = [];
	var dot; // dot representing joint

	// Create the dots representing each joint
	for (var i = 0; i < MAX_JOINTS; i++) {
	    dot = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	    $container.append( dot );

	    $( dot ).attr("x", 0);
	    $( dot ).attr("y", 0);
	    $( dot ).attr("width", 5);
	    $( dot ).attr("height", 5);
	    $( dot ).attr("fill", "00FFFF");
	    $( dot ).attr("class", "joint");

	    arr[i] = $( dot );
	} 
	return arr;
    } // setupJoints
    /*
      Sets up the element representing the user's head
      @param $container jquery element to use as container for head element
      @return the head as a jquery element
    */
    function setupHeadElement($container) {
	var dot; // dot representing joint
	// Create the dot representing the head
	dot = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
	$container.append( dot );

	$( dot ).attr("cx", 0);
	$( dot ).attr("cy", 0);
	$( dot ).attr("rx", 15);
	$( dot ).attr("ry", 15);
	$( dot ).attr("fill", "black");

	return $( dot );
    } //setupHeadElement
    /*
      Sets up the elements representing the bones
      @param $container jquery element to use as container for joint elements
      @return array containing references to the bones as jquery elements
     */
    function setupBoneElements($container) {
	var arr = [];
	var myLine;

	for (var i = 0; i < MAX_BONES; i++) {
	    myLine =  document.createElementNS('http://www.w3.org/2000/svg', 'line');
	    $container.append( myLine );

	    $( myLine ).attr("x1", 0);
	    $( myLine ).attr("y1", 0);
	    $( myLine ).attr("x2", 0);
	    $( myLine ).attr("y2", 0);
	    $( myLine ).attr("stroke-width", 2);
	    $( myLine ).attr("stroke", "blue");

	    arr[i] = $( myLine );
	}

	return arr;
    } // setupBones

    /*
      Sets up a list of bones with the correct bone-joint connections
      @return array containing bones that identify their connecting joints
     */
    function setupBoneMap() {
	var arr = [];
	
	// Along spine
	arr.push(new bone(1, 2));
	arr.push(new bone(2, 3));
	arr.push(new bone(3, 4));
	// Left arm
	arr.push(new bone(2, 6));
	arr.push(new bone(6, 7));
	arr.push(new bone(7, 8));
	arr.push(new bone(8, 9));
	// Right arm
	arr.push(new bone(2, 12));
	arr.push(new bone(12, 13));
	arr.push(new bone(13, 14));
	arr.push(new bone(14, 15));
	// Left leg
	arr.push(new bone(4, 17));
	arr.push(new bone(17, 18));
	arr.push(new bone(18, 19));
	arr.push(new bone(19, 20));
	// Right leg
	arr.push(new bone(4, 21))
	arr.push(new bone(21, 22));
	arr.push(new bone(22, 23));
	arr.push(new bone(23, 24));

	return arr;
    } // setupBoneMap
    /*
      Sets up an array of joints
      @return array of joints
     */
    function setupJointMap() {
	var arr = [];
	
	for (var i = 0; i < MAX_JOINTS; i++) {
	    arr[i] = new joint(0,0);
	}
	return arr;
    }
    /*
      Updates the position of a joint
      @param jointArr array of joints
      @param jointId id of the joint to update
      @param x the x position
      @param y the y position
     */
    function updateJoint(jointArr, jointId, x, y) {
	var joint;
	
	joint = jointArr[ zigfuIdToJointIndex(jointId) ];
	joint.x = x;
	joint.y = y;
    }
    /*
      Refreshes the positions of bone elements
      @param boneEles array of bone jquery elements
      @param boneArr array of bones, which identify the joints they connect to
      @param jointArr array of joints, which identify the joint's position
     */
    function refreshBoneElements(boneEles, boneArr, jointArr) {
	var $iBone; // temporary jquery element representing bone
	var iBone; // temporary bone
	var j1Index; // index of joint 1
	var j2Index; // index of joint 2
	var joint1;
	var joint2;

	for (var i = 0; i < MAX_BONES; i++) {
	    $iBone = boneEles[i];
	    iBone = boneArr[i];

	    // Get the indices of the bone's joints
	    j1Index = zigfuIdToJointIndex(iBone.jointId1);
	    j2Index = zigfuIdToJointIndex(iBone.jointId2);
	    // Get the joints
	    joint1 = jointArr[j1Index];
	    joint2 = jointArr[j2Index];
	    // Set bone's position
	    $iBone.attr("x1", joint1.x);
	    $iBone.attr("y1", joint1.y);
	    $iBone.attr("x2", joint2.x);
	    $iBone.attr("y2", joint2.y);
	}
    }
    /*
      Refreshes the positions of joint elements
      @param jointEles array of jquery elements representing the joints
      @param jointArr arry of the joints, which each have an x and y position
     */
    function refreshJointElements(jointEles, jointArr) {
	var $iJoint; // jquery element
	var joint;
	var halfWidth; // half the width of the joint element
	var halfHeight;

	halfWidth = jointEles[0].attr("width") / 2.0;
	halfHeight = jointEles[0].attr("height") / 2.0;

	// For each joint, set the corresponding jquery element's position
	for (var i = 0; i < MAX_JOINTS; i++) {
	    $iJoint = jointEles[i];
	    joint = jointArr[i];
	    // Set position of ith joint
	    $iJoint.attr("x", joint.x - halfWidth);
	    $iJoint.attr("y", joint.y - halfHeight);
	}
    } // refreshJointElements
    /*
      Refreshes the position of head element
      @param headEle jquery element representing the head
      @param jointArr arry of the joints, which each have an x and y position
     */
    function refreshHeadElement(headEle, jointArr) {
	var joint;

	joint = jointArr[0];
	headEle.attr("cx", joint.x);
	headEle.attr("cy", joint.y);
    }
    /*
      Representation of a bone, which has two joints at either end
     */
    function bone(jointId1, jointId2) {
	this.jointId1 = jointId1;
	this.jointId2 = jointId2;
    } // bone
    /*
      Representation of a joint, which has an x and y position
     */
    function joint(x, y) {
	this.x = x;
	this.y = y;
    }
    /*
      Converts the index of a joint used by this script to Zigfu's id value
      Zigfu ids 0, 5, 10, 11, 16, and 100 are ignored
      This function is the opposite of zigfuIdToJointIndex
      @param index 0-based index of the joint
      @return zigfu id for the joint
     */
    function jointIndexToZigfuId(index) {
	if (index <= 3) {
	    return index + 1;
	}
	else if (index <= 7) {
	    return index + 2;
	}
	else if (index <= 11) {
	    return index + 4;
	}
	else {
	    return index + 5;
	}
    } // jointIndexToZigfuVal
    /*
      Converts Zigfu's id value of a joint to a 0-based index
      Zigfu ids 0, 5, 10, 11, 16, and 100 are ignored
      This function is the opposite of jointIndexToZigfuId
      @param id the zigfu id for the joint
      @return 0-based index of the joint used by this script
     */
    function zigfuIdToJointIndex(id) {
	if (id <= 4) {
	    return id - 1;
	}
	else if (id <= 9) {
	    return id - 2;
	}
	else if (id <= 15) {
	    return id - 4;
	}
	else {
	    return id - 5;
	}
    }

    /* end Skeleton Stuff */




    // initialize global iterator
    frameCounter = 0;

    // By adding the radar object as a listener to the zig object, the zig object will now start calling
    // the callback functions defined in the radar object.
    zig.addListener(radar);

} //function loaded



document.addEventListener('DOMContentLoaded', radarLoaded, false);
