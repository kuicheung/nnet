package com.kinectnnet;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Set;

import org.encog.util.arrayutil.NormalizationAction;
import org.encog.util.arrayutil.NormalizedField;

public class DataSource implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = -7262320763515257386L;

	private class MinMax implements Serializable{
		/**
		 * 
		 */
		private static final long serialVersionUID = 372000411909123905L;
		public double min;
		public double max;
		
		public MinMax(double min, double max){
			this.min = min;
			this.max = max;
		}
	}
	
	private double[][] input;
	private double[][] ideal;
	private double[][] testInput;
	private double[][] testIdeal;
	private double[][] verifyInput;
	private double[][] verifyIdeal;
	private int[] testIndex = {90,76,64,54,43,33,21,16,3,1,0};
	private int[] verifyIndex = {56,8,23,20};
	private ArrayList<NormalizedField> inputNormFields;
	private ArrayList<NormalizedField> idealNormFields;
	
	private Set<Integer> testSetIndex;
	private Set<Integer> verifySetIndex;
	
	public DataSource(String source,int inputCount,int idealCount){
		testSetIndex = new HashSet<Integer>();
		for(int i=0;i<testIndex.length;i++){
			testSetIndex.add(testIndex[i]);
		}
		
		verifySetIndex = new HashSet<Integer>();
		for(int i=0;i<verifyIndex.length;i++){
			verifySetIndex.add(verifyIndex[i]);
		}
		
		String[] rows = source.split("\n");
		input = new double[rows.length-testIndex.length][inputCount];
		ideal = new double[rows.length-testIndex.length][idealCount];
		testInput = new double[testIndex.length][inputCount];
		testIdeal = new double[testIndex.length][idealCount];
		verifyInput = new double[verifyIndex.length][inputCount];
		verifyIdeal = new double[verifyIndex.length][idealCount];
		
		int inputCt=0,
			testCt=0,
			verifyCt=0;

		for(int i=0;i<rows.length;i++){
			if(testSetIndex.contains(i)){
				String[] cells = rows[i].split(",");
				parseRow(testCt,cells,testInput,testIdeal);	
				testCt++;
			}
			else if(verifySetIndex.contains(i)){
				String[] cells = rows[i].split(",");
				parseRow(verifyCt,cells,verifyInput,verifyIdeal);	
				verifyCt++;
			}
			else{
				String[] cells = rows[i].split(",");
				parseRow(inputCt,cells,input,ideal);
				inputCt++;
			}
		}
		
		inputNormFields = getNormalizedFields(getMinMax(input));
		idealNormFields = getNormalizedFields(getMinMax(ideal));
		
		input = normalizeData(input,inputNormFields);
		ideal = normalizeData(ideal,idealNormFields);
		testInput = normalizeData(testInput,inputNormFields);
		testIdeal = normalizeData(testIdeal,idealNormFields);
		verifyInput = normalizeData(verifyInput,inputNormFields);
		verifyIdeal = normalizeData(verifyIdeal,idealNormFields);
	}
	
	private void parseRow(int row, String[] cells,double[][] input,double[][] ideal){		
		int j;
		for(j=0;j<cells.length-1;j++){	
			input[row][j] = Double.parseDouble(cells[j]);
		}
		ideal[row][0] = Double.parseDouble(cells[j]);	
	}
	
	public double[][] getInput(){
		return input;
	}
	
	public ArrayList<NormalizedField> getInputNormFields(){
		return inputNormFields;
	}	
	
	public double[][] getIdeal(){
		return ideal;
	}
	
	public ArrayList<NormalizedField> getIdealNormFields(){
		return idealNormFields;
	}
	
	public double[][] getTestInput(){
		return testInput;
	}
	
	public double[][] getTestIdeal(){
		return testIdeal;
	}
	
	public double[][] getVerifyInput(){
		return verifyInput;
	}
	
	public double[][] getVerifyIdeal(){
		return verifyIdeal;
	}
	public double[][] normalizeData(double[][] data, ArrayList<NormalizedField> fields){
		for(int i=0;i<data.length;i++){
			for(int j=0;j<data[i].length;j++){
				data[i][j] = fields.get(j).normalize(data[i][j]);
			}
		}
		return data;
	}
	
	private ArrayList<MinMax> getMinMax(double[][] data){
		ArrayList<MinMax> minMaxList = new ArrayList<MinMax>();
		for(double col : data[0]){
			minMaxList.add(new MinMax(0,0));
		}
		for(int i=0;i<data.length;i++){
			for(int j=0;j<data[i].length;j++){
				if(data[i][j]<minMaxList.get(j).min){
					minMaxList.get(j).min = data[i][j];
				}
				else if(data[i][j]>minMaxList.get(j).max){
					minMaxList.get(j).max = data[i][j];
				}
			}
		}
		
		return minMaxList;
	}
	
	private ArrayList<NormalizedField> getNormalizedFields(ArrayList<MinMax> minMaxList){
		ArrayList<NormalizedField> fields = new ArrayList<NormalizedField>();
		
		for(MinMax minMax : minMaxList){
		fields.add(new NormalizedField(NormalizationAction.Normalize, 
				null,minMax.max,minMax.min,1,-1));
		}
		
		return fields;
	}
}