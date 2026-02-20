import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Conversation, User } from '@repo/shared';
import { messagingService } from '../services/messagingService';
import { useFocusEffect } from '@react-navigation/native';

type RootStackParamList = {
  Conversations: undefined;
  Chat: { conversationId: string };
  NewConversation: undefined;
};

type ConversationsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Conversations'
>;

interface ConversationsScreenProps {
  navigation: ConversationsScreenNavigationProp;
}

export const ConversationsScreen: React.FC<ConversationsScreenProps> = ({
  navigation,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[] | null>(null);

  const loadUsers = async () => {
    try {
      const data = await messagingService.getUsers();
      setUsers(data);
    } catch {
      setUsers([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, []),
  );

  const loadConversations = async () => {
    try {
      const data = await messagingService.getConversations();
      setConversations(data);
    } catch {
      Alert.alert('Error', 'Failed to load conversations');
    } finally {
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
    ></TouchableOpacity>
  );

  const createNewConversation = () => {
    navigation.navigate('NewConversation');
  };

  return <></>;
};

const styles = StyleSheet.create({});
