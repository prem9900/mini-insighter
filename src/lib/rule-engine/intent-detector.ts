// Intent detection from natural language questions
import { QueryIntent, QueryFilter } from '@/types/insight';

/**
 * Detect the intent from a user's question
 * Uses keyword pattern matching to determine query type
 */
export function detectIntent(question: string): QueryIntent {
    const lowerQuestion = question.toLowerCase();
    const filters = extractFilters(lowerQuestion);

    // Helper for word boundaries and optional plurals
    const hasWord = (word: string) => new RegExp(`\\b${word}s?\\b`, 'i').test(lowerQuestion);
    const hasPhrase = (phrase: string) => lowerQuestion.includes(phrase);

    // 0. Detect greetings
    if (hasWord('hi') || hasWord('hello') || hasWord('hey') || hasWord('greetings')) {
        return { type: 'greeting', filters: [] };
    }

    // 1. Detect time series
    if (hasPhrase('over time') || hasPhrase('trend') ||
        hasWord('month') || hasWord('day') || hasWord('year') || hasWord('week')) {
        return { type: 'time-series', timeColumn: 'date', filters };
    }

    // 2. Detect grouping
    if (hasWord('by') || hasWord('per') || hasWord('each')) {
        const groupByTerms = extractGroupByTerms(lowerQuestion);
        if (groupByTerms.length > 0 && !hasPhrase('per sale')) {
            return { type: 'grouping', groupBy: groupByTerms, filters };
        }
    }

    // 3. Detect aggregation operations
    // Priority: Count phrases first
    if (hasPhrase('how many') || hasPhrase('number of') || hasWord('count')) {
        return { type: 'aggregation', operation: 'count', filters };
    }

    if (hasWord('total') || hasWord('sum')) {
        return { type: 'aggregation', operation: 'sum', filters };
    }

    if (hasWord('average') || hasWord('avg') || hasWord('mean')) {
        return { type: 'aggregation', operation: 'avg', filters };
    }

    if (hasWord('maximum') || hasWord('max') || hasWord('highest') || hasWord('top')) {
        return { type: 'aggregation', operation: 'max', filters };
    }

    if (hasWord('minimum') || hasWord('min') || hasWord('lowest')) {
        return { type: 'aggregation', operation: 'min', filters };
    }

    // Default to list
    return { type: 'list', filters };
}

/**
 * Extract simple filters from question
 */
function extractFilters(question: string): QueryFilter[] {
    const filters: QueryFilter[] = [];

    // Helper for word boundaries and optional plurals
    const hasWord = (word: string) => new RegExp(`\\b${word}s?\\b`, 'i').test(question);

    const categories = ['Electronics', 'Clothing', 'Home'];
    const regions = ['North', 'South', 'East', 'West'];
    const products = ['Laptop', 'Smartphone', 'Sofa', 'T-Shirt', 'Jeans', 'Jacket', 'Table', 'Headphones', 'Shoes', 'Hat', 'Lamp', 'Scarf', 'Tablet', 'Chair', 'Dress', 'Monitor', 'Bed'];

    for (const cat of categories) {
        if (hasWord(cat.toLowerCase())) {
            filters.push({ column: 'category', operator: '=', value: cat });
        }
    }
    for (const reg of regions) {
        if (hasWord(reg.toLowerCase())) {
            filters.push({ column: 'region', operator: '=', value: reg });
        }
    }
    for (const prod of products) {
        if (hasWord(prod.toLowerCase())) {
            filters.push({ column: 'product', operator: '=', value: prod });
        }
    }

    return filters;
}

/**
 * Extract grouping terms from question
 */
function extractGroupByTerms(question: string): string[] {
    const terms: string[] = [];
    const hasWord = (word: string) => new RegExp(`\\b${word}\\b`, 'i').test(question);

    if (hasWord('category') || hasWord('categories')) {
        terms.push('category');
    }
    if (hasWord('month')) {
        terms.push('month');
    }
    if (hasWord('year')) {
        terms.push('year');
    }
    if (hasWord('day')) {
        terms.push('day');
    }
    if (hasWord('region') || hasWord('location')) {
        terms.push('region');
    }
    if (hasWord('product')) {
        terms.push('product');
    }
    if (hasWord('customer')) {
        terms.push('customer');
    }

    return terms;
}
