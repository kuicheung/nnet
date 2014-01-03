package com.kinectnnet;
import java.io.File;
import java.io.IOException;
import org.encog.util.file.FileUtil;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;


public class KinectParser {

     public Joint[] readKinectData(String input) throws IOException
     {
         //System.out.println(input);
         JsonParser parser = new JsonParser();
         JsonObject jointsJson = parser.parse(input).getAsJsonObject();

         Joint[] joints = new Joint[20];
         for (int i = 0; i < 20; i++)
         {
             joints[i] = new Joint();
         }
         for (JsonElement timeSlice : jointsJson.get("motiondata").getAsJsonArray())
         {
             int ct = 0;
             JsonObject skeleton = timeSlice.getAsJsonObject().get("skeleton").getAsJsonObject();
             for (int i = 1;i<=24;i++)
             {
            	 JsonObject joint = skeleton.get(""+i)!=null?skeleton.get(""+i).getAsJsonObject():null;
            	 if(joint!=null){
	                 joints[ct].jointNum = joint.get("id").getAsInt();
	                 joints[ct].posX.add(joint.get("position").getAsJsonArray().get(0).getAsDouble());
	                 joints[ct].posY.add(joint.get("position").getAsJsonArray().get(1).getAsDouble());
	                 joints[ct].posZ.add(joint.get("position").getAsJsonArray().get(2).getAsDouble());
	                 joints[ct].rot1.add(joint.get("rotation").getAsJsonArray().get(0).getAsDouble());
	                 joints[ct].rot2.add(joint.get("rotation").getAsJsonArray().get(1).getAsDouble());
	                 joints[ct].rot3.add(joint.get("rotation").getAsJsonArray().get(2).getAsDouble());
	                 joints[ct].rot4.add(joint.get("rotation").getAsJsonArray().get(3).getAsDouble());
	                 joints[ct].rot5.add(joint.get("rotation").getAsJsonArray().get(4).getAsDouble());
	                 joints[ct].rot6.add(joint.get("rotation").getAsJsonArray().get(5).getAsDouble());
	                 joints[ct].rot7.add(joint.get("rotation").getAsJsonArray().get(6).getAsDouble());
	                 joints[ct].rot8.add(joint.get("rotation").getAsJsonArray().get(7).getAsDouble());
	                 joints[ct++].rot9.add(joint.get("rotation").getAsJsonArray().get(8).getAsDouble());
            	 }
             }
         }
         return joints;
     }

     

}
