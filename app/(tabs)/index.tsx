import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { Text, View } from '@/components/Themed';
import { testBackend } from '@/lib/test-queries';

export default function TabOneScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<string>('Not tested yet');

  const runTest = async () => {
    setIsLoading(true);
    setTestResults('Testing...');
    
    try {
      const success = await testBackend();
      if (success) {
        setTestResults('✅ Backend test passed!');
        Alert.alert('Success', 'Backend is working correctly!');
      } else {
        setTestResults('❌ Backend test failed');
        Alert.alert('Error', 'Backend test failed. Check console for details.');
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResults(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      Alert.alert('Error', 'Failed to run backend test');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-run test on component mount
  useEffect(() => {
    runTest();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rento - Backend Test</Text>
      
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={runTest}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Run Backend Test'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>{testResults}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  testButton: {
    backgroundColor: '#2f95dc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    minHeight: 60,
    justifyContent: 'center',
  },
  resultText: {
    fontSize: 14,
    textAlign: 'center',
  },
});