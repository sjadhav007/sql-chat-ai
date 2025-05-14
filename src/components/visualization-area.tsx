
"use client";

import type { ChatMessage } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChartBig, FileJson, Info } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"; // Removed BarChart as ShadcnBarChart
import { Bar, XAxis, YAxis, CartesianGrid, BarChart as ShadcnBarChart } from 'recharts'; // Added BarChart as ShadcnBarChart from recharts
import type { ChartConfig } from "@/components/ui/chart";

interface VisualizationAreaProps {
  message: ChatMessage | null;
}

const VisualizationArea: React.FC<VisualizationAreaProps> = ({ message }) => {
  const renderContent = () => {
    if (!message) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">Data Visualizations & Results</p>
          <p className="text-sm text-muted-foreground">
            Query results and charts will appear here.
          </p>
        </div>
      );
    }

    if (message.type === 'chart' && message.chartData && message.chartConfig) {
      // Determine data keys for X and Y axis
      // Assuming first key is category (X or Y based on layout) and second is value
      const dataKeys = message.chartData.length > 0 ? Object.keys(message.chartData[0]) : [];
      if (dataKeys.length < 2) {
        return <p className="text-destructive">Not enough data keys to render chart.</p>;
      }
      
      const keyForCategory = dataKeys[0]; // e.g., 'month' or 'country'
      const keyForValue = dataKeys[1]; // e.g., 'sales' or 'customers'

      // Ensure the chartConfig uses the actual data keys
      const finalChartConfig: ChartConfig = {
        [keyForValue]: {
          label: message.chartConfig[keyForValue]?.label || keyForValue,
          color: message.chartConfig[keyForValue]?.color || "hsl(var(--primary))",
        },
      };
      
      // Determine if layout should be vertical or horizontal based on data type
      // Simple heuristic: if first key is string-like, assume it's categorical for YAxis in horizontal layout
      // or XAxis in vertical layout. Most business charts are vertical bars.
      const layout: "vertical" | "horizontal" = "vertical";


      return (
        <ChartContainer config={finalChartConfig} className="w-full h-[350px] md:h-[400px] lg:h-[450px]">
          <ShadcnBarChart accessibilityLayer data={message.chartData} layout={layout}>
            <CartesianGrid vertical={layout === "vertical"} horizontal={layout === "horizontal"} />
            {layout === "vertical" ? (
              <>
                <XAxis dataKey={keyForCategory} type="category" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis dataKey={keyForValue} type="number" tickLine={false} axisLine={false} tickMargin={8} />
              </>
            ) : (
              <>
                <XAxis dataKey={keyForValue} type="number" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis dataKey={keyForCategory} type="category" tickLine={false} axisLine={false} width={80} tickMargin={8} />
              </>
            )}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Bar dataKey={keyForValue} fill={`var(--color-${keyForValue})`} radius={5} />
          </ShadcnBarChart>
        </ChartContainer>
      );
    }

    if (message.type === 'json_data' || (message.type === 'chart' && typeof message.content === 'string')) {
       // If it's chart type but no chartData, show raw content
      return (
        <pre className="bg-gray-800 dark:bg-gray-900 text-white p-3 rounded-md overflow-auto text-sm max-h-[calc(100vh-200px)] whitespace-pre-wrap break-all">
          <code>{message.content}</code>
        </pre>
      );
    }
    
    // Fallback for other AI message types or if chart rendering fails
    return (
      <div className="p-4 text-sm text-muted-foreground">
        <p>{typeof message.content === 'string' ? message.content : 'No visualizable data for this message.'}</p>
      </div>
    );

  };

  return (
    <div className="flex flex-col h-full p-4 bg-muted">
      <Card className="flex-1 flex flex-col overflow-hidden shadow-lg">
        <CardHeader className="border-b">
          <div className="flex items-center">
            {message?.type === 'chart' ? <BarChartBig className="h-6 w-6 mr-2 text-accent" /> : <FileJson className="h-6 w-6 mr-2 text-accent" />}
            <CardTitle className="text-lg">
              {message?.type === 'chart' ? 'Data Visualization' : 'Query Results'}
            </CardTitle>
          </div>
          {message && <CardDescription className="mt-1 text-xs">{`Displaying data for message sent at ${message.timestamp?.toLocaleTimeString()}`}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualizationArea;
