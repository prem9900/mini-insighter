// Insight types
import { VisualizationType } from './chat';

export interface InsightResult {
    sql: string;
    data: Record<string, unknown>[];
    visualization_type: VisualizationType;
    metadata?: {
        row_count: number;
        execution_time_ms?: number;
    };
}

export interface QueryIntent {
    type: 'aggregation' | 'grouping' | 'filtering' | 'time-series' | 'list' | 'greeting';
    operation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
    groupBy?: string[];
    filters?: QueryFilter[];
    timeColumn?: string;
}

export interface QueryFilter {
    column: string;
    operator: string;
    value: unknown;
}

export interface ChartData {
    labels: string[];
    values: number[];
}
