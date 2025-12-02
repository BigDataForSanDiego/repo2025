// Transcript View Component with Auto-Scroll

import React, { useEffect, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { TranscriptViewProps } from '../types/components';
import { TranscriptEntry } from '../types/api';
import { UI_CONFIG } from '../config/app.config';

// Memoized transcript item component for performance
const TranscriptItem = memo(({ entry }: { entry: TranscriptEntry }) => {
  const isUser = entry.speaker === 'user';

  return (
    <View
      style={[
        styles.transcriptItem,
        isUser ? styles.userMessage : styles.agentMessage,
      ]}
    >
      <Text
        style={[
          styles.transcriptText,
          isUser ? styles.userText : styles.agentText,
        ]}
      >
        {entry.text}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(entry.timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );
});

TranscriptItem.displayName = 'TranscriptItem';

export const TranscriptView: React.FC<TranscriptViewProps> = ({
  entries,
  resourceCardVisible,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const { height: screenHeight } = useWindowDimensions();

  // Auto-scroll to bottom when new entries are added
  useEffect(() => {
    if (entries.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [entries]);

  // Calculate dynamic height based on resource card visibility
  const calculateHeight = () => {
    if (resourceCardVisible) {
      // Reduce height when resource card is visible
      const resourceCardHeight = screenHeight * UI_CONFIG.resourceCardHeightPercent;
      const voiceButtonHeight = UI_CONFIG.voiceButtonSize + 40; // Including margins
      const availableHeight = screenHeight - resourceCardHeight - voiceButtonHeight;
      return Math.max(UI_CONFIG.transcriptMinHeight, availableHeight);
    }

    // Default height when no resource card
    const voiceButtonHeight = UI_CONFIG.voiceButtonSize + 40;
    return screenHeight - voiceButtonHeight - 100; // 100px for padding
  };

  const renderItem = ({ item }: { item: TranscriptEntry }) => (
    <TranscriptItem entry={item} />
  );

  const keyExtractor = (item: TranscriptEntry, index: number) =>
    `${item.timestamp}-${index}`;

  if (entries.length === 0) {
    return (
      <View style={[styles.container, { height: calculateHeight() }]}>
        <Text style={styles.emptyText}>
          Conversation will appear here...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: calculateHeight() }]}>
      <FlatList
        ref={flatListRef}
        data={entries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        // Performance optimizations
        windowSize={10}
        maxToRenderPerBatch={10}
        removeClippedSubviews={true}
        initialNumToRender={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  transcriptItem: {
    marginVertical: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E7EB',
  },
  agentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#3B82F6',
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userText: {
    color: '#1F2937',
  },
  agentText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 40,
  },
});
