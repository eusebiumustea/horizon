import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { messagingService } from '../services/messagingService';

type RootStackParamList = {
  Conversations: undefined;
  Chat: { conversationId: string };
  NewConversation: undefined;
};

type NewConversationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'NewConversation'
>;

interface NewConversationScreenProps {
  navigation: NewConversationScreenNavigationProp;
}

export const NewConversationScreen: React.FC<NewConversationScreenProps> = ({
  navigation,
}) => {
  const [name, setName] = useState('');
  const [otherUsername, setOtherUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateConversation = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a conversation name');
      return;
    }
    if (!otherUsername.trim()) {
      Alert.alert('Error', 'Please enter another username');
      return;
    }

    setLoading(true);
    try {
      // First, ensure the other user exists by creating/fetching them
      const otherUser = await messagingService.createUser(otherUsername.trim());

      const currentUserId = messagingService.getUserId();
      if (!currentUserId) {
        Alert.alert('Error', 'No current user found');
        return;
      }

      const conversation = await messagingService.createConversation({
        type: 'direct',
        name: name.trim(),
        participantIds: [otherUser.id],
      });

      navigation.replace('Chat', { conversationId: conversation.id });
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to create conversation: ' + JSON.stringify(error),
      );
      console.error('Create conversation error:', JSON.stringify(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>New Conversation</Text>

      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter conversation name"
        maxLength={100}
      />

      <TextInput
        style={styles.input}
        value={otherUsername}
        onChangeText={setOtherUsername}
        placeholder="Enter other user's username"
        maxLength={50}
        autoCapitalize="none"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateConversation}
        disabled={loading || !name.trim() || !otherUsername.trim()}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Creating...' : 'Create Conversation'}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
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
