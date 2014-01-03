package com.kinectnnet;
import java.util.ArrayList;


public class JointConverted {
	public static final int POINTS_PER_JOINTS = 6;
	public int jointNum;
    public ArrayList<Double> posX = new ArrayList<Double>();
    public ArrayList<Double> posY = new ArrayList<Double>();
    public ArrayList<Double> posZ = new ArrayList<Double>();
    public ArrayList<Double> rot1 = new ArrayList<Double>();
    public ArrayList<Double> rot2 = new ArrayList<Double>();
    public ArrayList<Double> rot3 = new ArrayList<Double>();
    
    public JointConverted(Joint joint){
        for (int i = 0; i < joint.rot1.size(); i++)
        {
        	posX.add(joint.posX.get(i));
        	posY.add(joint.posY.get(i));
        	posZ.add(joint.posZ.get(i));
            rot1.add(Math.atan2(joint.rot8.get(i), joint.rot9.get(i)));
            rot2.add(Math.atan2(-joint.rot7.get(i), Math.sqrt(joint.rot8.get(i)*joint.rot8.get(i)+joint.rot9.get(i)*joint.rot9.get(i))));
            rot3.add(Math.atan2(joint.rot4.get(i), joint.rot1.get(i)));
        }
    }
    
    public ArrayList<Double> getPosX(){
    	return posX;
    }
}
