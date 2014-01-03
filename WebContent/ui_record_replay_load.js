/*
  This script controls the User Interface with JQuery
  Unlike ui.js, this version saves data to server, using JQUERY and AJAX when a user ends their recording session.
  Unlike ui_motiondata.js, this does not save data to the server
  Unlike ui_record_replay.js, this version can initiate loading frame data from the server
  
  NOTE: Requires loaded prior: jquery, record_replay_load_skeleton
  record_replay_load_skeleton.js:
  - FRAME_TIMEOUT
  - radar


  
  Author: Tien Nguyen
*/


// DOM elements
var $buttonContainer = null; // holds start, stop, and start/stop replay buttons
var $startReplayButton = null; // the start replay button
var $stopReplayButton = null; // the stop replay button
var $startButton = null; // the start recording  button
var $stopButton = null; // the stop recording button
var $startLoadplayButton = null; // the start button for loading a replay from server
var $stopLoadplayButton = null; // the stop button for stopping replay of loaded frame data
// Some UI stuff
var sessionCounter = 0; // count the sessions
var frameCounter = 0; // count the frames since recording session
var isRecording = false; // true if recording a session
var isReplaying = false; // true if replaying the recording
// Data recorded
var userdata = {}; // user's kinect motion data
var lastRecording = {}; // last recorded user frames. In motiondata format.


window.onload = function() {
	
    initMotionCaptures();
    // Save the important button elements from the page
    $buttonContainer = $("#record-buttons-container");
    $startButton = $("#startButton");
    $stopButton = $("#stopButton");
    $startReplayButton = $("#startReplayButton");
    $stopReplayButton = $("#stopReplayButton");
    $startLoadplayButton = $("#startLoadplayButton");
    $stopLoadplayButton = $("#stopLoadplayButton");
    // Set click listeners to buttons
    $startButton.click(startRecording);
    $stopButton.click(stopRecording);
    $startReplayButton.click(startReplay);
    $stopReplayButton.click(stopReplay);
    $startLoadplayButton.click(startLoadplay);
    $stopLoadplayButton.click(stopLoadplay);
    // Initialize the user interface with the start and replay buttons
    initUI();
    
    // load profiles from server
    var profileList = $("#profile-list");
    loadProfiles(profileList);
    profileList.change(function(){
    	var selectedVal = $("#profile-list :selected").val();
    	$.ajax({
    		url:"profile",
    		type:"GET",
    		data:{
    			filename:selectedVal
    		},
    		success: function(data){
    			if(data){
    				$("#profile-text").val(data);
    				scoreCheck(JSON.parse(data));
    			}	
    		}
    	});
    });
};

/*
 * Send an ajax request to server to retrieve a list of 
 * motion profiles in json format.  A list of profile <option> tags 
 * will be added to the passed in <select> tag.
 * @param profileList the <select> tag where the profiles will
 * be added to
 */
function loadProfiles(profileList){
	$.ajax({
		url:"profiles",
		type: "GET",
		success: function(data){
			//console.log(data);
			data = JSON.parse(data);
			$.each(data,function(key,val){
				profileList.append('<option value="'+val+'">'+val+'</option>')
				
			});
			
		}
	});
}

/*
  Initializes the UI with the start and replay buttons
*/
function initUI() {
    // Detach Stop, Stop Replay, Stop loadplay buttons
    $stopButton.detach();
    $stopReplayButton.detach();
    $stopLoadplayButton.detach();
    // Append start, start replay, Start Loadplay buttons
    $buttonContainer.append($startButton);
    $buttonContainer.append($startReplayButton);
    $buttonContainer.append($startLoadplayButton);
}
/*
  Initializes user data objects
*/
function initMotionCaptures() {
    resetUserdata();
    // Last recording should be set to {motiondata:[]}
    lastRecording = {};
    lastRecording.motiondata = [];
} // initMotionCaptures
/*
  resets the userdata variable to {motiondata:[]}
*/
function resetUserdata() {
    userdata = {};
    userdata.motiondata = [];
} // resetUserdata

/*
  Stashes the recorded data to the variable used by record_replay_skeleton.js
*/
function saveRecording(userdata) {
    // Clone the userdata
    lastRecording = JSON.parse(JSON.stringify(userdata));
}

/*
  Start the recording, remove "start" buttons from GUI, attach "stop" button to GUI
  Parameters:
  evt - Not used
*/
function startRecording(evt) {
    //console.log("Started recording");

    // Resets the userdata to store new kinect data captures from scratch
    resetUserdata();

    // Detach the start, start replay, start loadplay buttons. Keep click listeners
    $startButton.detach();
    $startReplayButton.detach();
    $startLoadplayButton.detach();
    // append the stop button
    $buttonContainer.append($stopButton);

    // Reset frame counter
    frameCounter = 0;
    // Increment session counter
    sessionCounter += 1;
    // Allow recording
    isRecording = true;
} //startRecording

/*
  Stops recording and resets GUI to initial setup
*/
function stopRecording() {
    // Save the userdata to be able to be replayed
    saveRecording(userdata);

    // Detach Stop button, bring back initial button setup
    initUI();

    // Reset values that should reset
    frameCounter = 0; // count the frames since recording session
    isRecording = false; // true if recording a session
} //stopRecording
/*
 * Starts the replay, remove "start" buttons from GUI, attach "stop" button to GUI, and calls doReplay(0, lastRecording)
 */
function startReplay() {
    // Detach Start, StartReplay, Start Loadplay buttons from UI,
    $startButton.detach();
    $startReplayButton.detach();
    $startLoadplayButton.detach();
    // append stop replay button
    $buttonContainer.append($stopReplayButton);
    
    // Begin replay
    isReplaying = true;
    doReplay(0, lastRecording);
}
/*
  Does the replay
  Recursively calls itself.
  Note: Depends on the radar variable from record_replay_skeleton.js
  @param frameCounter count of frames elapsed in the replay
  @param lastRecording object representing the user data profile to play back
*/
function doReplay(frameCounter, lastRecording) {
    
    // Play back the recorded frames until finished
    if (isReplaying && frameCounter < lastRecording.motiondata.length) {
	radar.onFrameUpdate(lastRecording.motiondata[frameCounter]);
	// Periodically Check adherence to Kungfu Principles
	if (frameCounter % PRINCIPLE_CHECK_FRAMES === 0) {

	} // if time to check principle
	// update again after timeout
	setTimeout( function () {
	    doReplay(frameCounter + 1, lastRecording);
        }, FRAME_TIMEOUT);
    }
    else {
	// End of replay
	console.log("Replay ended");
	stopReplay();
    }
}

/*
  Ends the replay and brings back UI to initial setup
*/
function stopReplay() {
    // Detach Stop replay button, bring back initial button setup
    initUI();

    // Reset values that should reset
    frameCounter = 0; // count the frames since recording session
    isReplaying = false;
}
/*
 * Starts the replay on the loaded user data and calls doReplay(0, LOADED_USER_DATA)
 * Removes "start" buttons from GUI, attach "stop" button to GUI 
 */
function startLoadplay() {
    var recording;
    
    // Detach Start, StartReplay, Start Loadplay buttons from UI,
    $startButton.detach();
    $startReplayButton.detach();
    $startLoadplayButton.detach();
    // Append stop loadplay button
    $buttonContainer.append($stopLoadplayButton);
    
    // Begin replay
    isReplaying = true;
    recording = loadUserFrames("Cheung_Jeffrey-s5_u0");

    doReplay(0, recording);
} // startLoadplay
/*
 * Stops loaded replay and resets GUI to initial setup
 */
function stopLoadplay() {
    // Detach Stop replay button, bring back initial button setup
    initUI();

    // Reset values that should reset
    frameCounter = 0; // count the frames since recording session
    isReplaying = false;
} // stopLoadplay
/*
 * Loads a user's kinect frame data from the server
 * @param id some string identifying the desired recording to load
 * @return object representing the user data motion profile loaded from server
 */
function loadUserFrames(id) {
    var userData; // object representation of user motion profile
    
    // Load the user motion profile data from server as an object
    /*$.ajax({
        url: "getReplayData.php",
        async: false,
        type: "GET",
        data: {
                filename: id
        },
        dataType: "json",
        success: function (json) {
            userData = json;
        },
            error: function( xhr, status, errorThrown ) {
            console.log( "An error occured.\n" + xhr + "\nstatus" + status + "\n" + errorThrown );
            // Set an empty user motion profile
            userData = {};
            userData.motiondata = [];
            },
        complete: function( xhr, status ) { // stuff to do when done
        } 
    }); //endof ajax*/
    userData = JSON.parse($("#profile-text").val());
    
    return userData;
}

