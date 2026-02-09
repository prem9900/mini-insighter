console.log('Starting verification script...');
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables IMMEDIATELY before any other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verify() {
    console.log('Testing BigQuery connection...');

    // Dynamic import to ensure this happens AFTER dotenv.config()
    const { testConnection } = await import('./src/lib/bigquery/client');

    const success = await testConnection();

    if (success) {
        console.log('SUCCESS: BigQuery connection verified.');
    } else {
        console.log('FAILED: Unable to connect to BigQuery.');
        process.exit(1);
    }
}

verify().catch(err => {
    console.error('Verification failed with error:', err);
    process.exit(1);
});
