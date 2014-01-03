package com.kinectnnet;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.TreeMap;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.encog.util.file.FileUtil;

import com.google.gson.Gson;

/**
 * Servlet implementation class compute
 */
@WebServlet("/compute")
public class compute extends HttpServlet {
	private static final long serialVersionUID = 1L;
	ArrayList<Network> nets; 
	String masterData;
	Joint[] masterJoints;
    /**
     * @throws ClassNotFoundException 
     * @throws IOException 
     * @see HttpServlet#HttpServlet()
     */
    public compute() throws ClassNotFoundException, IOException {
        super();
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		
		
		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		String contextPath = request.getServletContext().getRealPath("/");
		if(nets==null){
	        try {
				nets = Network.loadNetworks(contextPath+"data/networks.ser");
			} catch (ClassNotFoundException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
		}
		KinectParser parser = new KinectParser();
		if(masterJoints==null){
	        masterData = FileUtil.readFileAsString(new File(contextPath+"data/second_Steven-s2_u0.txt"));	        
	        masterJoints = parser.readKinectData(masterData);
		}
		String profile = request.getParameter("motionprofile");
		if(profile!=null){
			Joint[] joints = parser.readKinectData(profile);
			TreeMap<Integer,Double[]> scores = DTW.scoreJoints(joints, masterJoints);
	
			
			HashMap<String,Double> netScores = new HashMap<String,Double>();
			for(Network net : nets){
				String name = net.getName();
				double score = net.compute(scores);
				netScores.put(name,score);	
			}
			Gson gson = new Gson();
			PrintWriter writer = response.getWriter();
			writer.write(gson.toJson(netScores));
			writer.close();
		}
		
		/*try {
			ArrayList<Network> nets = Network.loadNetworks("c:/tomcat/data/networks.ser");
			request.getSession().setAttribute("nets", nets);
			KinectParser parser = new KinectParser();
			
			Joint[] joints = parser.readKinectData(FileUtil.readFileAsString(new File("c:/tomcat/data/K3_Nicholas-s60_u0.txt")));
			TreeMap<Integer,Double[]> scores = DTW.scoreJoints(joints, masterJoints);
			
			request.getSession().setAttribute("joints", joints);
			request.getSession().setAttribute("dtwScores", scores);
			
			HashMap<String,Double> netScores = new HashMap<String,Double>();
			for(Network net : nets){
				netScores.put(net.getName(),net.compute(scores));
			}
			request.getSession().setAttribute("netScores",netScores);
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
		
		response.sendRedirect("/nnet");*/
	}
}
