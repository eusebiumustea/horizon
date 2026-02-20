import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { messagingService } from '../services/messagingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  UserSetup: { onUserSetup: (userId: string) => void };
};

interface UserSetupScreenProps {
  onUserSetup: (userId: string) => void;
}

export const UserSetupScreen: React.FC<UserSetupScreenProps> = ({
  onUserSetup,
}) => {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async () => {
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    setLoading(true);
    try {
      const user = await messagingService.createUser(username.trim());
      await AsyncStorage.setItem('userId', user.id);
      messagingService.setUserId(user.id);
      onUserSetup(user.id);
    } catch (error) {
      Alert.alert('Error', 'Failed to create user: ' + JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Messenger</Text>
      <Text style={styles.subtitle}>Enter a username to get started</Text>

      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Username"
        maxLength={50}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateUser}
        disabled={loading || !username.trim()}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Get Started'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
