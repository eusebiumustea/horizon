import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { SocketProvider } from "./src/contexts/SocketContext";
import { ConversationsScreen } from "./src/screens/ConversationsScreen";
import { ChatScreen } from "./src/screens/ChatScreen";

type RootStackParamList = {
  Conversations: undefined;
  Chat: { conversationId: string };
  NewConversation: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SocketProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Conversations">
          <Stack.Screen
            name="Conversations"
            component={ConversationsScreen}
            options={{ title: "Messages" }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{ title: "Chat" }}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SocketProvider>
  );
}
