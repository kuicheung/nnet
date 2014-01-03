package com.kinectnnet;
import java.util.ArrayList;


public class Joint
    {
        public int jointNum;
        public ArrayList<Double> posX = new ArrayList<Double>();
        public ArrayList<Double> posY = new ArrayList<Double>();
        public ArrayList<Double> posZ = new ArrayList<Double>();
        public ArrayList<Double> rot1 = new ArrayList<Double>();
        public ArrayList<Double> rot2 = new ArrayList<Double>();
        public ArrayList<Double> rot3 = new ArrayList<Double>();
        public ArrayList<Double> rot4 = new ArrayList<Double>();
        public ArrayList<Double> rot5 = new ArrayList<Double>();
        public ArrayList<Double> rot6 = new ArrayList<Double>();
        public ArrayList<Double> rot7 = new ArrayList<Double>();
        public ArrayList<Double> rot8 = new ArrayList<Double>();
        public ArrayList<Double> rot9 = new ArrayList<Double>();
        
        public ArrayList<Double> getPosX(){
        	return posX;
        }
    }