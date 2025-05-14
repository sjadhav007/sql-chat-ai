"use client";

import { useState, useEffect } from 'react';
import ChatInterface from '@/components/chat-interface';
import VisualizationArea from '@/components/visualization-area';
import type { ChatMessage } from '@/types';
import { processUserQuery } from '@/lib/actions';
import Logo from '@/components/logo';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const examplePrompts = [
  "Show total sales by month",
  "How many customers per country?",
  "What are the top 3 selling products by quantity?",
  "List all sales in the 'Electronics' category for the last quarter.",
  "Find customers who joined in the last 6 months."
];

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      sender: 'ai',
      type: 'text',
      content: "Hello! I'm SQL Insights AI. Ask me questions about your data, and I'll generate SQL queries, show results, and provide insights.",
      timestamp: new Date(),
    }
  ]);
  const [activeVisualizationMessageId, setActiveVisualizationMessageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async (question: string) => {
    setIsLoading(true);
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      type: 'text',
      content: question,
      timestamp: new Date(),
    };
    // Add user message first, then make a new state for AI responses
    setMessages(prev => [...prev, userMessage]);

    try {
      const aiResponses = await processUserQuery(question);
      setMessages(prev => [...prev, ...aiResponses]);
      
      // Find the latest chart or data message to set for visualization
      const chartOrDataMessage = [...aiResponses].reverse().find(msg => msg.type === 'chart' || msg.type === 'json_data');
      if (chartOrDataMessage) {
        setActiveVisualizationMessageId(chartOrDataMessage.id);
      } else {
        // If no new chart/data, clear visualization or keep previous one?
        // For now, let's clear it if the latest interaction didn't produce one
        // setActiveVisualizationMessageId(null); 
        // Or, find the latest data/chart message from all messages:
        const latestVisMessage = [...messages, ...aiResponses].reverse().find(msg => msg.type === 'chart' || msg.type === 'json_data');
        if (latestVisMessage) setActiveVisualizationMessageId(latestVisMessage.id);

      }
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessageContent = error instanceof Error ? error.message : String(error);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender: 'ai',
        type: 'error',
        content: `Sorry, I encountered an error: ${errorMessageContent}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Error",
        description: `Could not process your request. ${errorMessageContent.substring(0,100)}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically set initial visualization to the first AI message if it's data/chart
   useEffect(() => {
    if (!activeVisualizationMessageId) {
      const initialVisMessage = messages.find(msg => msg.type === 'chart' || msg.type === 'json_data');
      if (initialVisMessage) {
        setActiveVisualizationMessageId(initialVisMessage.id);
      }
    }
  }, [messages, activeVisualizationMessageId]);


  const visualizationMessage = messages.find(msg => msg.id === activeVisualizationMessageId) || null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <aside className="w-[260px] bg-card border-r border-border flex-col p-4 shadow-lg hidden md:flex">
        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
          <Logo />
          <h1 className="text-xl font-bold text-primary">SQL Insights AI</h1>
        </div>
        <ScrollArea className="flex-1">
          <div className="text-sm text-muted-foreground mb-4">
            <p className="font-semibold text-foreground mb-2">How I Can Help:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Convert your questions to SQL.</li>
              <li>Display query results.</li>
              <li>Summarize data insights.</li>
              <li>Visualize data with charts.</li>
            </ul>
          </div>
          <div className="mt-6">
            <p className="font-semibold text-foreground mb-2 text-sm">Example Prompts:</p>
            <div className="space-y-2">
              {examplePrompts.map(prompt => (
                <Button 
                  key={prompt}
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left h-auto py-1.5 px-2 text-xs text-muted-foreground hover:text-accent-foreground hover:bg-accent"
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        </ScrollArea>
         <div className="mt-auto pt-4 border-t border-border text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} SQL Insights AI. 
        </div>
      </aside>
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-3/5 lg:w-2/3 border-r border-border flex flex-col h-full">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
        <div className="md:w-2/5 lg:w-1/3 flex flex-col h-full bg-muted">
          <VisualizationArea message={visualizationMessage} />
        </div>
      </main>
    </div>
  );
}
