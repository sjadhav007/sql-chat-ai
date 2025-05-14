import type { ChartConfig } from "@/components/ui/chart";

export type MessageSender = 'user' | 'ai' | 'system';

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  content: string | React.ReactNode;
  type: 'text' | 'sql' | 'json_data' | 'insight' | 'error' | 'chart';
  chartData?: any[];
  chartConfig?: ChartConfig; // Using ChartConfig type from shadcn
  timestamp?: Date;
}
