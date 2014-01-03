#########
# Notes #
#########

# Connecting DTW script #

- When replaying, Every X amount of frames ui_record_replay_load.js will cause principles to be checked.
- This is done via ajax request in kungfu_principle_checker.js, sendPrincipleCheck() method.
- In sendPrincipleCheck(), Replace "DTW.php" with the name of the DTW script and change the data parameters as needed. The parameter is assumed to be a json string using the user motion profile data format.
- The DTW script should ideally return an array of scores.
- The amount of scores depends on the number of principle scores Dr. Tseng wants us to check.
- CUrrently the code only does 3 of the principles.


# Changing the frequency of kungfu principle checking #

see kungfu_principle_checker.js