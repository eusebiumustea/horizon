import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Conversation } from "@repo/shared";
import { messagingService } from "../services/messagingService";

type RootStackParamList = {
  Conversations: undefined;
  Chat: { conversationId: string };
  NewConversation: undefined;
};

type ConversationsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Conversations"
>;

interface ConversationsScreenProps {
  navigation: ConversationsScreenNavigationProp;
}

export const ConversationsScreen: React.FC<ConversationsScreenProps> = ({
  navigation,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await messagingService.getConversations();
      setConversations(data);
    } catch (error) {
      Alert.alert("Error", "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate("Chat", { conversationId: item.id })}
    >
      <View style={styles.conversationContent}>
        <Text style={styles.conversationName}>
          {item.name || item.participants.map((p) => p.user.name).join(", ")}
        </Text>
        {item.lastMessage && (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage.sender.name}: {item.lastMessage.content}
          </Text>
        )}
      </View>
      <Text style={styles.timestamp}>
        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ""}
      </Text>
    </TouchableOpacity>
  );

  const createNewConversation = () => {
    navigation.navigate("NewConversation");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading conversations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.newButton}
          onPress={createNewConversation}
        >
          <Text style={styles.newButtonText}>New</Text>
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={createNewConversation}
          >
            <Text style={styles.startButtonText}>Start a conversation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          style={styles.list}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  newButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  newButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  startButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  conversationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  conversationContent: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
  },
});
