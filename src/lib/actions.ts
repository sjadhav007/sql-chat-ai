'use server';

import { generateSqlQuery, type GenerateSqlQueryInput } from '@/ai/flows/generate-sql-query';
import { summarizeDataInsights, type SummarizeDataInsightsInput } from '@/ai/flows/summarize-data-insights';
import type { ChatMessage } from '@/types';
import type { ChartConfig } from "@/components/ui/chart";

// Dummy table schema for the AI
const TABLE_SCHEMA = `
CREATE TABLE sales (
  id INT PRIMARY KEY,
  product_name VARCHAR(255),
  category VARCHAR(100),
  quantity_sold INT,
  sale_date DATE, -- Format YYYY-MM-DD
  unit_price DECIMAL(10, 2),
  total_revenue DECIMAL(10, 2),
  region VARCHAR(50)
);

CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  email VARCHAR(100),
  join_date DATE, -- Format YYYY-MM-DD
  city VARCHAR(50),
  country VARCHAR(50)
);

-- Example: To get sales by month, you might use:
-- SELECT strftime('%Y-%m', sale_date) as month, SUM(total_revenue) as total_sales FROM sales GROUP BY month ORDER BY month;
`;

const mockSalesByMonth = [
  { month: "Jan", sales: 4000 },
  { month: "Feb", sales: 3000 },
  { month: "Mar", sales: 5000 },
  { month: "Apr", sales: 4500 },
  { month: "May", sales: 6000 },
  { month: "Jun", sales: 5500 },
];

const mockCustomersByCountry = [
  { country: "USA", customers: 120 },
  { country: "Canada", customers: 80 },
  { country: "UK", customers: 65 },
  { country: "Germany", customers: 50 },
  { country: "France", customers: 40 },
];

export async function processUserQuery(question: string): Promise<ChatMessage[]> {
  const newMessages: ChatMessage[] = [];
  const timestamp = new Date();

  try {
    // 1. Generate SQL Query
    const sqlInput: GenerateSqlQueryInput = { question, tableSchema: TABLE_SCHEMA };
    const sqlOutput = await generateSqlQuery(sqlInput);
    const sqlQuery = sqlOutput.sqlQuery;

    newMessages.push({
      id: crypto.randomUUID(),
      sender: 'ai',
      type: 'sql',
      content: sqlQuery,
      timestamp,
    });

    // 2. (Simulate) Execute Query & Get Results
    let queryResultsData: any = { query: sqlQuery, note: "Query execution is simulated. This is mock data." };
    let chartData: any[] | undefined = undefined;
    let chartConfig: ChartConfig | undefined = undefined;
    let messageType: ChatMessage['type'] = 'json_data';

    // Simple keyword matching for mock data. A real app would execute the SQL.
    const lowerQuestion = question.toLowerCase();
    const lowerSqlQuery = sqlQuery.toLowerCase();

    if (lowerQuestion.includes("sales by month") || lowerSqlQuery.includes("strftime('%m'") || lowerSqlQuery.includes("month(sale_date)")) {
      queryResultsData = mockSalesByMonth;
      chartData = mockSalesByMonth;
      chartConfig = {
        month: { label: "Month" },
        sales: { label: "Total Sales", color: "hsl(var(--accent))" },
      } satisfies ChartConfig;
      messageType = 'chart';
    } else if (lowerQuestion.includes("customers by country") || lowerSqlQuery.includes("group by country")) {
      queryResultsData = mockCustomersByCountry;
      chartData = mockCustomersByCountry;
      chartConfig = {
        country: { label: "Country" },
        customers: { label: "Number of Customers", color: "hsl(var(--chart-2))" },
      } satisfies ChartConfig;
      messageType = 'chart';
    } else {
       // Generic mock result for other queries
       queryResultsData = [
        { columnA: "value1", columnB: 100, columnC: "detailX" },
        { columnA: "value2", columnB: 200, columnC: "detailY" },
        { columnA: "value3", columnB: 150, columnC: "detailZ" },
      ];
    }
    
    const resultsContent = typeof queryResultsData === 'string' ? queryResultsData : JSON.stringify(queryResultsData, null, 2);

    const dataMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'ai',
      type: messageType,
      content: resultsContent,
      timestamp,
    };
    if (chartData && chartConfig) {
      dataMessage.chartData = chartData;
      dataMessage.chartConfig = chartConfig;
    }
    newMessages.push(dataMessage);

    // 3. Summarize Data Insights
    const insightsInput: SummarizeDataInsightsInput = { queryResults: resultsContent };
    const insightsOutput = await summarizeDataInsights(insightsInput);

    newMessages.push({
      id: crypto.randomUUID(),
      sender: 'ai',
      type: 'insight',
      content: insightsOutput.summary,
      timestamp,
    });

    return newMessages;

  } catch (error) {
    console.error("Error processing query:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Check if the error is from Genkit flow (e.g., invalid API key)
    if (errorMessage.includes("API key not valid")) {
       return [{
        id: crypto.randomUUID(),
        sender: 'ai',
        type: 'error',
        content: "There's an issue with the AI service configuration (e.g. API key). Please check the server setup.",
        timestamp,
      }];
    }
    return [{
      id: crypto.randomUUID(),
      sender: 'ai',
      type: 'error',
      content: `An error occurred while processing your request: ${errorMessage}`,
      timestamp,
    }];
  }
}
