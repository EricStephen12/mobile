import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Dimensions, Platform, KeyboardAvoidingView, ScrollView, Image, ActivityIndicator } from 'react-native';
import Svg, { Path, G, Polygon, Circle } from 'react-native-svg';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useTheme } from '../theme/ThemeContext';

const { width } = Dimensions.get('window');


const sansFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  default: 'sans-serif',
});

// --- Icons ---
const BackArrow = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

const DotsMenu = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="5" cy="12" r="1.5" fill={color} stroke="none" />
    <Circle cx="12" cy="12" r="1.5" fill={color} stroke="none" />
    <Circle cx="19" cy="12" r="1.5" fill={color} stroke="none" />
  </Svg>
);

const BoltIcon = ({ color }: { color: string }) => (
  <Svg width={10} height={10} viewBox="0 0 24 24" fill={color} stroke="none">
    <Polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Svg>
);

const SendIcon = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </Svg>
);

// Minimal Flower Icon for AI messages
const MinimalFlower = ({ color }: { color: string }) => (
  <Svg width={22} height={22} viewBox="-20 -20 40 40">
    <G>
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <Path
          key={i}
          transform={`rotate(${angle})`}
          d="M 0,0 C -5,-8 -4,-18 0,-20 C 4,-18 5,-8 0,0"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeOpacity="0.9"
        />
      ))}
      <Circle cx="0" cy="0" r="2" fill={color} />
    </G>
  </Svg>
);

// Mock chat messages
const INITIAL_MESSAGES = [
  {
    id: '1',
    sender: 'user',
    text: 'Why does this ad perform well?',
  },
  {
    id: '2',
    sender: 'ai',
    text: "The ad hooks early, builds curiosity, and delivers a clear transformation. It's short, visual, and emotionally engaging.",
  },
  {
    id: '3',
    sender: 'user',
    text: "What's the weakest part?",
  },
  {
    id: '4',
    sender: 'ai',
    text: "The CTA could be stronger. It appears a bit late and gets less focus.",
  },
  {
    id: '5',
    sender: 'user',
    text: "How can I improve it?",
  },
  {
    id: '6',
    sender: 'ai',
    text: "Show the product benefit again during the CTA and make it more direct.",
  },
];

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const sessionId = params.sessionId as string;
  const { isDark, colors } = useTheme();
  const { getToken } = useAuth();
  const { user } = useUser();
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000';

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [dna, setDna] = useState<any>(null);
  const [sessionTitle, setSessionTitle] = useState('Analysis Session');
  const [sessionMode, setSessionMode] = useState<'ad' | 'content'>('ad');
  const [sessionThumb, setSessionThumb] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }
    const fetchSession = async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const res = await fetch(`${API_URL}/api/lounge-session/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDna(data.dna || {});
          setSessionTitle(data.title || 'Analysis Session');
          setSessionMode(data.dna?.mode || data.mode || 'ad');
          // Use first frame thumbnail if available
          if (data.dna?.frames?.[0]) {
            setSessionThumb(data.dna.frames[0]);
          } else if (data.thumbnail) {
            setSessionThumb(data.thumbnail);
          }
          
          let msgs = data.messages || [];
          if (typeof msgs === 'string') {
            try { msgs = JSON.parse(msgs); } catch(e){}
          }
          if (msgs.length === 0) {
            msgs = [{ id: 'init', role: 'assistant', sender: 'ai', text: "Hey there! I've just watched this video. Ask me anything about its hook, pacing, or psychology!" }];
          } else {
            // Map existing api format (role, content) to UI format (sender, text) if needed
            msgs = msgs.map((m: any, i: number) => ({
              ...m,
              id: m.id || i.toString(),
              sender: m.role === 'user' ? 'user' : 'ai',
              text: m.text || m.content
            }));
          }
          setMessages(msgs);
        }
      } catch (err) {
        console.error('Chat fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId, user]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const userText = inputText.trim();
    const newMsg = {
      id: Date.now().toString(),
      sender: 'user',
      role: 'user',
      text: userText,
      content: userText,
    };
    
    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setInputText('');
    setSending(true);

    try {
      const token = await getToken();
      const apiMessages = updatedMessages.map(m => ({
        role: m.role || (m.sender === 'user' ? 'user' : 'assistant'),
        content: m.content || m.text
      }));

      const res = await fetch(`${API_URL}/api/creative-director-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: apiMessages,
          dna: dna || {},
          userId: user?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          role: 'assistant',
          text: data.message,
          content: data.message
        };
        const finalMessages = [...updatedMessages, aiMsg];
        setMessages(finalMessages);

        // Save session in background
        if (sessionId) {
          fetch(`${API_URL}/api/save-lounge-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              sessionId,
              messages: finalMessages.map(m => ({ role: m.role, content: m.content })),
              userId: user?.id
            })
          }).catch(() => {});
        }
      } else {
        alert("Failed to get response");
      }
    } catch (err) {
      alert("Network error sending message");
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* ── HEADER ── */}
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <BackArrow color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.campaignRow}>
            {sessionThumb ? (
              <Image
                source={{ uri: sessionThumb }}
                style={styles.thumbnail}
              />
            ) : (
              <View style={[styles.thumbnail, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
                <MinimalFlower color={colors.primary} />
              </View>
            )}
            <View style={styles.campaignInfo}>
              <Text style={[styles.campaignTitle, { color: colors.text }]} numberOfLines={1}>{sessionTitle}</Text>
              <View style={[styles.modePill, { backgroundColor: colors.badgeBg, borderColor: colors.surfaceBorder }]}>
                <BoltIcon color={colors.primary} />
                <Text style={[styles.pillText, { color: colors.text }]}>{sessionMode === 'content' ? 'Content Intelligence' : 'Ad Intelligence'}</Text>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.menuButton}>
          <DotsMenu color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
          ) : (
            messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <View key={msg.id} style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi]}>
                  {!isUser && (
                    <View style={styles.aiIconWrapper}>
                      <MinimalFlower color={colors.primary} />
                    </View>
                  )}
                  <View style={[styles.messageBubble, isUser ? [styles.bubbleUser, { backgroundColor: colors.primary }] : [styles.bubbleAi, { backgroundColor: colors.surface }]]}>
                    <Text style={[styles.messageText, isUser ? styles.textUser : [styles.textAi, { color: colors.text }]]}>
                      {msg.text || msg.content}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
          {sending && (
            <View style={[styles.messageRow, styles.messageRowAi]}>
              <View style={styles.aiIconWrapper}>
                <MinimalFlower color={colors.primary} />
              </View>
              <View style={[styles.messageBubble, styles.bubbleAi, { backgroundColor: colors.surface }]}>
                <ActivityIndicator color={colors.primary} size="small" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── INPUT AREA ── */}
        <View style={styles.inputContainer}>
          <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.surfaceBorder }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask anything..."
              placeholderTextColor={colors.textSubtle}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={handleSend}
              activeOpacity={0.8}
            >
              <SendIcon />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111111',
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  campaignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumbnail: {
    width: 36,
    height: 36,
    borderRadius: 6,
  },
  campaignInfo: {
    gap: 4,
  },
  campaignTitle: {
    fontSize: 14,
    fontFamily: sansFont,
    fontWeight: '600',
    color: '#ffffff',
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#1a220d',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2d3f11',
  },
  pillText: {
    fontSize: 10,
    fontFamily: sansFont,
    fontWeight: '600',
  },
  menuButton: {
    padding: 4,
  },
  keyboardView: {
    flex: 1,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 24,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '85%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
  },
  messageRowAi: {
    alignSelf: 'flex-start',
    gap: 12,
  },
  aiIconWrapper: {
    marginTop: 8,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    backgroundColor: '#111111',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14.5,
    fontFamily: sansFont,
    lineHeight: 22,
  },
  textUser: {
    color: '#000000',
    fontWeight: '500',
  },
  textAi: {
    color: '#e2e8f0',
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 12 : 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#111111',
    borderRadius: 28,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 15,
    fontFamily: sansFont,
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
