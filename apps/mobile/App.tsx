import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SocketProvider } from './src/contexts/SocketContext';
import { ConversationsScreen } from './src/screens/ConversationsScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { NewConversationScreen } from './src/screens/NewConversationScreen';
import { UserSetupScreen } from './src/screens/UserSetupScreen';
import { messagingService } from './src/services/messagingService';

type RootStackParamList = {
  Conversations: undefined;
  Chat: { conversationId: string };
  NewConversation: undefined;
  UserSetup: { onUserSetup: (userId: string) => void };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          messagingService.setUserId(storedUserId);
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleUserSetup = (newUserId: string) => {
    setUserId(newUserId);
  };

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <SocketProvider>
      <NavigationContainer>
        <Stack.Navigator>
          {!userId ? (
            <Stack.Screen
              name="UserSetup"
              children={() => <UserSetupScreen onUserSetup={handleUserSetup} />}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen
                name="Conversations"
                component={ConversationsScreen}
                options={{ title: 'Messages' }}
              />
              <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{ title: 'Chat' }}
              />
              <Stack.Screen
                name="NewConversation"
                component={NewConversationScreen}
                options={{ title: 'New Conversation' }}
              />
            </>
          )}
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SocketProvider>
  );
}
