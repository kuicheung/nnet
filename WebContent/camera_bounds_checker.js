/*
  Responsible for warning if user's joints go out of bounds, using JQUERY
  The bounds are the camera bounds.

  NOTE: Requires record_replay_skeleton.js, jquery, and zig.js loaded prior.
  record_replay_skeleton.js: 
  - KINECT_WIDTH, KINECT_HEIGHT

  Author: Tien Nguyen
*/


// This object indicates warnings when user joints are out of bound
var boundsChecker = {
    onuserfound: function (user) {
    },
    onuserlost: function (user) {
    },
    ondataupdate: function (zigdata) {
	// For each user in zigdata, check if any joint goes out of bounds
	// if so, do something
	for (var userid in zigdata.users) {
	    // For each user id, get the corresponding user's data for the frame
	    var frameData = zigdata.users[userid];
	    for (var jointId in frameData.skeleton) {
		// For each joint in frame data skeleton, check if out of bounds
		var joint = frameData.skeleton[jointId];
		if ( jointIsOutside(joint, KINECT_WIDTH, KINECT_HEIGHT) ) {
		    // TODO: Out of bounds, do something
		    console.log('Joint ' + jointId + ' is out of bounds');



		}
	    }
	} // for
    }
};

/**
   Returns true if the joint is outside of the camera's view bounds
   @param joint the joint, an object with a 3-element array called position
   @param widthBound horizontal width of the bounding box
   @param heightBound vertical length of the bounding box
*/
function jointIsOutside(joint, widthBound, heightBound) {
    var isOutside;
    var widthHalf;
    var heightHalf;
    var jointx;
    var jointy;

    widthHalf = widthBound / 2.0;
    heightHalf = heightBound / 2.0;

    jointx = joint.position[0];
    jointy = joint.position[1];

    // The origin is the camera
    // Horizontal bounds are widthHalf amount to either side from the camera
    // Vertical bounds are heightHalf amount above and below the camera    
    isOutside = (jointx < -1 * widthHalf) || (jointx > widthHalf)
	|| (jointy < -1 * heightHalf) || (jointy > heightHalf);

    return isOutside;
}


// Add to zig so that it can respond to zig data updates
zig.addListener(boundsChecker);