package com.kinectnnet;
import java.io.File;
import java.io.IOException;
import java.util.TreeMap;

import org.encog.util.file.FileUtil;

import com.google.common.primitives.Doubles;

public class DTW {

   public static TreeMap<Integer,Double[]> scoreJoints(Joint[] joints,Joint[] masterJoints){
	   TreeMap<Integer,Double[]> scores = new TreeMap<Integer,Double[]>();
	  
	   for(int i=0;i<joints.length;i++){
		   JointConverted jointC = new JointConverted(masterJoints[i]);
		   JointConverted masterJointC = new JointConverted(joints[i]);
		   Double[] jointScores = new Double[6];
		   jointScores[0] = DTWDistance(Doubles.toArray(jointC.rot1),
					Doubles.toArray(masterJointC.rot1));
		   jointScores[1] = DTWDistance(Doubles.toArray(jointC.rot2),
					Doubles.toArray(masterJointC.rot2));
		   jointScores[2] = DTWDistance(Doubles.toArray(jointC.rot3),
					Doubles.toArray(masterJointC.rot3));
		   jointScores[3] = DTWDistance(Doubles.toArray(jointC.posX),
				   						Doubles.toArray(masterJointC.posX));
		   jointScores[4] = DTWDistance(Doubles.toArray(jointC.posY),
						Doubles.toArray(masterJointC.posY));
		   jointScores[5] = DTWDistance(Doubles.toArray(jointC.posZ),
						Doubles.toArray(masterJointC.posZ));		   
		   scores.put(joints[i].jointNum,jointScores);
	   }
	   return scores;
   }
   
   private static double DTWDistance(double[] a1, double[] a2){
	   
	   
	   int n = a1.length;
	   int m = a2.length;
	   
	   Double[][] dtw = new Double[n][m];

	   for(int i=0;i<n;i++)
		   dtw[i][0] = 100000000.0;
	   for(int i=0;i<m;i++)
		   dtw[0][i] = 100000000.0;
	   dtw[0][0] = 0.0;

	   Double cost = 0.0;
	   for(int i=1;i<n;i++){
		   for(int j=1;j<m;j++){
			   cost = Math.abs(a1[i]-a2[j]);
			   dtw[i][j] = cost + min(dtw[i-1][j],
					   				dtw[i][j-1],
					   				dtw[i-1][j-1]);
		   }
	   }
	   
	   return dtw[n-1][m-1];

	}
   
   private static double min(double d1,double d2,double d3){
	   double min = d1;
	   if(d2<min)
		   min = d2;
	   if(d3<min)
		   min = d3;
	   
	   return min;
	   
   }
	   

}
