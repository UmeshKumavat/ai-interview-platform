"use client";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  StreamTheme,
  SpeakerLayout,
  useCallStateHooks,
  useCall,
  CallingState,
  CallControls,
} from "@stream-io/video-react-sdk";
import { Loader2, MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  Channel,
  Chat,
  MessageComposer,
  MessageList,
  Window,
  useCreateChatClient,
} from "stream-chat-react";
import AIQuestionsPanel from "./AIQuestionsPanel";

const CallUI = ({
  callId,
  isInterviewer,
  booking,
  onLeave,
  apiKey,
  token,
  currentUser,
}) => {
  const { useCallCallingState } = useCallStateHooks();
  const call = useCall();
  const callingState = useCallCallingState();

  const [activeTab, setActiveTab] = useState("chat");

  // ── Chat client — same token works for both Video + Chat SDKs ──
  const chatClient = useCreateChatClient({
    apiKey,
    tokenOrProvider: token,
    userData: {
      id: currentUser.id,
      name: currentUser.name,
      image: currentUser.imageUrl,
    },
  });

  const [chatChannel, setChatChannel] = useState(null);

  useEffect(() => {
    if (!chatClient) return;

    const channel = chatClient.channel("messaging", callId, {
      name: "Interview Chat",
      members: [
        booking.interviewer.clerkUserId,
        booking.interviewee.clerkUserId,
      ],
    });

    channel
      .watch()
      .then(() => setChatChannel(channel))
      .catch(console.error);

    return () => {
      channel.stopWatching().catch(() => {});
    };
  }, [chatClient, callId, booking]);

  // Auto-stop recording before leaving
  const handleLeave = useCallback(async () => {
    try {
      if (call) {
        const isRecording = call.state?.recording;
        if (isRecording) {
          await call.stopRecording().catch(() => {});
        }
        await call.leave().catch(() => {});
      }
    } finally {
      onLeave();
    }
  }, [call, onLeave]);

  if (callingState === CallingState.LEFT) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center gap-3">
        <p className="text-stone-400 text-sm">Leaving call…</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-[#0a0a0b] flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/8 shrink-0">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="border-white/10 text-stone-500 text-xs"
          >
            {booking.interviewer.name}
            <span className="text-stone-700 mx-1.5">×</span>
            {booking.interviewee.name}
          </Badge>

          {isInterviewer && (
            <Badge
              variant="outline"
              className="border-amber-400/20 bg-amber-400/5 text-amber-400 text-xs"
            >
              Interviewer
            </Badge>
          )}
        </div>
      </div>

      {/* Body: video + side panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── LEFT: Video ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto pb-20">
          <StreamTheme>
            <SpeakerLayout participantBarPosition="bottom" />
            <CallControls onLeave={handleLeave} />
          </StreamTheme>
        </div>

        {/* ── RIGHT: Chat / AI panel ── */}
        <div className="w-80 shrink-0 flex flex-col border-l border-white/8 bg-[#0a0a0b] h-full">
          {/* Tab switcher */}
          <Tabs defaultValue="chat" className="h-full flex flex-col dark">
            <style dangerouslySetInnerHTML={{ __html: `
              .str-chat__theme-dark, .str-chat {
                --str-chat__background-color: #0a0a0b !important;
                --str-chat__primary-surface-color: #0a0a0b !important;
                --str-chat__secondary-surface-color: #141417 !important;
                --str-chat__primary-font-color: #ffffff !important;
                --str-chat__secondary-font-color: #a1a1aa !important;
                --str-chat__message-textarea-background-color: #141417 !important;
                --str-chat__border-color: rgba(255, 255, 255, 0.08) !important;
              }
              .str-chat-react__main-container {
                height: 100% !important;
              }
              /* Hide scrollbars for all elements in the sidebar while keeping functionality */
              .dark *::-webkit-scrollbar {
                display: none !important;
              }
              .dark * {
                scrollbar-width: none !important; /* Firefox */
                -ms-overflow-style: none !important; /* IE and Edge */
              }
              .str-chat__composer {
                background-color: #0a0a0b !important;
              }
            `}} />
            <TabsList variant="line" className="flex w-full">
              <TabsTrigger value="chat" className="w-1/2 h-6 py-2">
                <MessageSquare size={13} />
                Chat
              </TabsTrigger>
              {isInterviewer && (
                <TabsTrigger value="questions" className="w-1/2 h-6 py-2">
                  <Sparkles size={13} />
                  AI Questions
                </TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="chat" className="flex-1 min-h-0 relative">
              {chatClient && chatChannel ? (
                <div className="absolute inset-0 flex flex-col bg-[#0a0a0b] dark str-chat__theme-dark">
                  <Chat client={chatClient} theme="str-chat__theme-dark">
                    <div className="flex-1 flex flex-col min-h-0 h-full">
                      <Channel channel={chatChannel}>
                        <Window>
                          <MessageList />
                          <MessageComposer />
                        </Window>
                      </Channel>
                    </div>
                  </Chat>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Loader2 size={18} className="text-stone-600 animate-spin " />
                </div>
              )}
            </TabsContent>
            <TabsContent value="questions" className="flex-1 min-h-0 relative">
              <div className="absolute inset-0">
                <AIQuestionsPanel categories={booking.categories} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Panel content */}
        </div>
      </div>
    </div>
  );
};

export default CallUI;
