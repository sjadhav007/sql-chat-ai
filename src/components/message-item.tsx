"use client";

import type { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, User, Code2, Lightbulb, AlertTriangle, FileJsonIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MessageItemProps {
  message: ChatMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  const Icon = isUser ? User : Bot;
  const avatarFallback = isUser ? 'U' : 'AI';

  const getMessageSpecificIcon = () => {
    switch (message.type) {
      case 'sql':
        return <Code2 className="h-5 w-5 text-blue-500" />;
      case 'insight':
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'json_data':
      case 'chart': // Chart data is also JSON initially
        return <FileJsonIcon className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };
  
  const getTitle = () => {
    switch (message.type) {
      case 'sql': return "Generated SQL Query";
      case 'insight': return "Data Insight";
      case 'json_data': return "Query Results (JSON)";
      case 'chart': return "Chart Data (JSON)";
      case 'error': return "Error";
      default: return null;
    }
  };

  const renderContent = () => {
    if (message.type === 'sql' || message.type === 'json_data' || (message.type === 'chart' && typeof message.content === 'string')) {
      return (
        <pre className="bg-gray-800 dark:bg-gray-900 text-white p-3 rounded-md overflow-x-auto text-sm whitespace-pre-wrap break-all">
          <code>{message.content}</code>
        </pre>
      );
    }
    return <div className="whitespace-pre-wrap break-words">{message.content}</div>;
  };
  
  const title = getTitle();

  return (
    <div className={cn("flex items-start gap-3 my-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="h-8 w-8 border border-border">
          <AvatarImage src={undefined} alt="AI Avatar" />
          <AvatarFallback className="bg-primary text-primary-foreground"><Icon className="h-4 w-4" /></AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
          "max-w-[75%] p-3 rounded-lg shadow-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"
        )}
      >
        {title && !isUser && (
           <div className="flex items-center gap-2 mb-2 border-b pb-1 border-border">
            {getMessageSpecificIcon()}
            <p className="font-semibold text-sm">{title}</p>
          </div>
        )}
        {renderContent()}
        {message.timestamp && (
          <p className={cn("text-xs mt-1", isUser ? "text-blue-200 dark:text-blue-300" : "text-muted-foreground")}>
            {message.timestamp.toLocaleTimeString()}
          </p>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 border border-border">
           <AvatarImage src={undefined} alt="User Avatar" />
          <AvatarFallback className="bg-secondary text-secondary-foreground"><Icon className="h-4 w-4" /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageItem;
