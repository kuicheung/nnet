/*
  Used for checking kungfu scores


  NOTE:
  Requires the following loaded before this:
  record_replay_skeleton.js
  - colorByScores()
  

*/

// Number of frames between each check of user's adherence to kungfu principles
var PRINCIPLE_CHECK_FRAMES = 8;

/*
 * Sends ajax request to server to check profile scores for different principles
 * @param userData kinect motion profile in json format
 * @return 6 principle scores for motion profile
 */
function scoreCheck(userData){
    $.ajax({
        url: "compute",
        type: "POST",
        data: {motionprofile:JSON.stringify(userData)},
        success: function(data){
            data = JSON.parse(data);
            var scoreListLeft = $("#scores-list-left");
            var scoreListRight = $("#scores-list-right");
            scoreListLeft.html('');
            scoreListRight.html('');
            $.each(data,function(key,val){
            	scoreListLeft.append('<div>'+key+'</div>');
            	scoreListRight.append('<div>'+val+'</div>');
            });
            console.log(data);
            visualizeScoring([
	            data.HipInititation,
	            data.SpiralTransfer,
	            data.OppositionRecoil,
	            data['Wrist-Elbow-ShoulderAlignment'],
	            data.Wristalignmentwithchest,
	            data.ShouldersDown
	        ]);            
            console.log('after score: before click');
            $("#startLoadplayButton").click();
        }
     });
}

/*
  Sends ajax request to server to check last few frames with kungfu principle
  @param userdata the user motion profile to send to server
  @param amt amount of most recent user frames to send. If amt > available frames, all frames are sent.
*/
function sendPrincipleCheck(userdata, amt) {
    var sendData; // data to send

    sendData = copyLastUserProfile(userdata, amt);

    // Send frame data to be checked and receive array of principle scores
    $.ajax({
	url: "DTW.php",
	async: false,
	type: "GET",
	data: {
            json: JSON.stringify(sendData)
	},
	dataType: "json",
	success: function (json) {
	    scores = json; // array containing 3 principle scores
	    visualizeScoring(scores[0], scores[1], scores[2]);
	},
        error: function( xhr, status, errorThrown ) {
	    console.log( "An error occured.\n" + xhr + "\nstatus" + status + "\n" + errorThrown );
        },
	complete: function( xhr, status ) { // stuff to do when done
	} 
    }); //endof ajax

} // sendPrincipleCheck
/*
  Copies last amt amount of frames of a user motion pofile
  @param userdata user motion profile to copy from
  @param amt amount of frames to copy
  @return user motion profile with copy of the last amt of frames from userdata
*/
function copyLastUserProfile(userdata, amt) {
    var copyData; // copy of data
    var ct, i; // iterator
    var frameCopy; // temporary

    // Format the data copy in the same way as the userdata object
    copyData = {};
    copyData.motiondata = [];
    // Copy the last amt number of userdata frames
    /* Algorithm to add frames to copyData.motiondata: 
       1. Push in frames from userdata starting at last and going backwards
       2. Reverse copyData.motiondata
    */
    ct = 0; // count of copied frames
    i = userdata.motiondata.length - 1; // index of frame to add
    while (ct < amt && i > 0) {
	// Copy the frame at the index to sendData
	frameCopy = JSON.parse(JSON.stringify( userdata.motiondata[i] ));
	copyData.motiondata.push( frameCopy );
	// Iterate
	ct++;
	i--;
    }
    // Reverse the sendData motion data frames
    copyData.motiondata.reverse();

    return copyData
} // copyLastUserProfile
/*
  Causes the skeleton to change color based on principle scores
  @param score1 Hip Initiation score
  @param score2 Shoulders Down score
  @param score3 Spinal Transfer & Spinal Posture
*/
function visualizeScoring(score1, score2, score3) {
    colorByScores(score1, score2, score3);
} // visualizeScoring
