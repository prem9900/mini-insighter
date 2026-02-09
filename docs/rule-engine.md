# Rule Engine

## Overview

The rule engine converts natural language queries into SQL statements using pattern matching.

## How It Works

1. **Pattern Matching**: User input is matched against predefined regex patterns
2. **SQL Generation**: Matched patterns trigger SQL generation functions
3. **Validation**: Generated SQL is validated for safety
4. **Execution**: Valid SQL is executed on BigQuery

## Example Rules

### Show Data
- **Pattern**: `show me {columns} from {table}`
- **SQL**: `SELECT {columns} FROM {table}`

### Count Records
- **Pattern**: `how many {table}`
- **SQL**: `SELECT COUNT(*) FROM {table}`

### Filter Data
- **Pattern**: `show {columns} from {table} where {condition}`
- **SQL**: `SELECT {columns} FROM {table} WHERE {condition}`

## Adding New Rules

```typescript
{
  pattern: /your regex pattern/i,
  action: (match) => `YOUR SQL TEMPLATE ${match[1]}`
}
```

## Safety

- SQL validation prevents dangerous operations
- Only SELECT queries allowed
- No DROP, DELETE, TRUNCATE, or ALTER statements
