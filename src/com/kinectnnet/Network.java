package com.kinectnnet;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Map;

import org.encog.engine.network.activation.ActivationSigmoid;
import org.encog.engine.network.activation.ActivationTANH;
import org.encog.ml.data.MLData;
import org.encog.ml.data.MLDataPair;
import org.encog.ml.data.MLDataSet;
import org.encog.ml.data.basic.BasicMLData;
import org.encog.ml.data.basic.BasicMLDataSet;
import org.encog.neural.networks.BasicNetwork;
import org.encog.neural.networks.layers.BasicLayer;
import org.encog.neural.networks.training.propagation.resilient.ResilientPropagation;
import org.encog.util.arrayutil.NormalizedField;
import org.encog.util.file.FileUtil;


public class Network implements Serializable{

		/**
	 * 
	 */
	private static final long serialVersionUID = -6770386755035001775L;
		private MLDataSet trainingSet;
		private MLDataSet testSet;
		private MLDataSet verifySet;
		private BasicNetwork network ;
		private DataSource source;
		private double testError;
		private double verifyError;
		private String name;
		private int[] jointsIndex;
		
	public Network(Network newNetwork){
		this.trainingSet = newNetwork.trainingSet;
		this.testSet = newNetwork.testSet;
		this.verifySet = newNetwork.verifySet;
		this.network = newNetwork.network;
		this.testError = newNetwork.testError;
		this.source = newNetwork.source;
		this.name = newNetwork.name;
		this.jointsIndex = newNetwork.jointsIndex;
	}
	
	public Network(String fileName,int inputCt, int idealCt,int[] jointsIndex) throws IOException{
		source = new DataSource(
						FileUtil.readFileAsString(new File(fileName)),inputCt,idealCt);
		this.name = fileName.split("\\.")[0];
		trainingSet = new BasicMLDataSet(source.getInput(),source.getIdeal());
		testSet = new BasicMLDataSet(source.getTestInput(),source.getTestIdeal());
		verifySet = new BasicMLDataSet(source.getVerifyInput(),source.getVerifyIdeal());
		testError = 100;
		this.jointsIndex = jointsIndex;
		
		network = new BasicNetwork();// create a neural network, without using a factory
		network.addLayer(new BasicLayer(new ActivationTANH(),true,trainingSet.getInputSize()));
		network.addLayer(new BasicLayer(new ActivationTANH(),true,trainingSet.getInputSize()+2));
		network.addLayer(new BasicLayer(new ActivationTANH(),true,trainingSet.getInputSize()+2));
		network.addLayer(new BasicLayer(new ActivationTANH(),false,trainingSet.getIdealSize()));
		network.getStructure().finalizeStructure();
		network.reset();
	}
	
	public void train(){
		// train the neural network
		final ResilientPropagation train = new ResilientPropagation(network, trainingSet);
	
		int epoch = 1;

		do {
			train.iteration();
			if(epoch%10000==0)
				System.out.println("Epoch #" + epoch + " Error:" + train.getError());
			epoch++;
		} while(epoch < 50000 && train.getError() > 0.00001);
		train.finishTraining();
		System.out.println("Epoch #" + epoch + " Error:" + train.getError());
	}
	
	public double compute(Map<Integer,Double[]> scores){
		double[] input = new double[jointsIndex.length*scores.get(1).length];
		int inputCt=0;
		for(int index : jointsIndex){
			for(int i=0;i<scores.get(1).length;i++){
				input[inputCt++]=scores.get(index)[i];
			}
		}
		ArrayList<NormalizedField> norm = source.getInputNormFields();
		double[][] inputAry = new double[][]{input};
		inputAry = source.normalizeData(inputAry, norm);
		input = inputAry[0];
		NormalizedField normIdeal = source.getIdealNormFields().get(0);
		double computedscore = network.compute(new BasicMLData(input)).getData(0);
		double normScore = normIdeal.deNormalize(computedscore);
		double score = Math.round(normScore*2.0)/2.0;
		return score;
	}
	
	public double test(){
		// test the neural network
				System.out.println("Neural Network Results:");
				NormalizedField norm = source.getIdealNormFields().get(0);
				/*for(MLDataPair pair: getTrainingSet() ) {
					final MLData output = network.compute(pair.getInput());
					double roundedOutput = (Math.round((norm.deNormalize(output.getData(0))*2.0)))/2.0;
					System.out.println(pair.getInput().getData(0) 
							+ ", actual=" + norm.deNormalize(output.getData(0))
							+ ", rounded="+roundedOutput 
							+ ", ideal=" + Math.round(norm.deNormalize(pair.getIdeal().getData(0))*2.0)/2.0);
				}*/
				System.out.println("Neural Network Test Set Results:");
				for(MLDataPair pair: testSet ) {
					final MLData output = network.compute(pair.getInput());
					double roundedOutput = (Math.round((norm.deNormalize(output.getData(0))*2.0)))/2.0;
					System.out.println(pair.getInput().getData(0) 
							+ ", actual=" + norm.deNormalize(output.getData(0))
							+ ", rounded="+roundedOutput 
							+ ", ideal=" + Math.round(norm.deNormalize(pair.getIdeal().getData(0))*2.0)/2.0);
				}
				testError = network.calculateError(testSet);
				System.out.println("Error: "+ testError);
				System.out.println("RMS Error: "+Math.sqrt(network.calculateError(testSet)));
				
				System.out.println("Neural Network Verify Set Results:");
				for(MLDataPair pair: verifySet ) {
					final MLData output = network.compute(pair.getInput());
					double roundedOutput = (Math.round((norm.deNormalize(output.getData(0))*2.0)))/2.0;
					System.out.println(pair.getInput().getData(0) 
							+ ", actual=" + norm.deNormalize(output.getData(0))
							+ ", rounded="+roundedOutput 
							+ ", ideal=" + Math.round(norm.deNormalize(pair.getIdeal().getData(0))*2.0)/2.0);
				}
				verifyError = network.calculateError(verifySet);
				System.out.println("Error: "+ verifyError);
				System.out.println("RMS Error: "+Math.sqrt(network.calculateError(verifySet)));
				
				return testError;
	}
	
	public BasicNetwork getNetwork(){
		return network;
	}
	
	public MLDataSet getTrainingSet(){
		return trainingSet;
	}

	public MLDataSet getTestSet(){
		return testSet;
	}

	public double getTestError(){
		return testError;
	}
	
	public DataSource getSource(){
		return source;
	}
	
	public int[] getJointsIndex(){
		return jointsIndex;
	}
	
	public String getName(){
		return name;
	}
	
	public double getVerifyError(){
		return verifyError;
	}
	
	@SuppressWarnings("unchecked")
	public static ArrayList<Network> loadNetworks(String filename) throws ClassNotFoundException{
		//load networks
		try{
			FileInputStream fin = new FileInputStream(filename);
			ObjectInputStream ois = new ObjectInputStream(fin); 
			return (ArrayList<Network>) ois.readObject();
		}
		catch(IOException e){
			e.printStackTrace();
			return null;
		}
		
	}
	
	public static void saveNetworks(String filename,ArrayList<Network> networks) throws IOException{
		//save networks
		FileOutputStream fout = new FileOutputStream(filename);
		ObjectOutputStream oos = new ObjectOutputStream(fout);   
		oos.writeObject(networks);
		oos.close();
	}
}
