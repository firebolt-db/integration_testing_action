const maxRetries = 3;
// Delay between retries in milliseconds
const backoffDelayMs = 1000; // 1 second
// If we hit rate limit, wait for 60 seconds before retrying
const backoffDelayRateLimit = 60000; // 60 seconds


export async function retryWithBackoff(fn) {
    let retryCount = 0;
    while (retryCount < maxRetries) {
        try {
            return await fn();
        } catch (error) {
            if (error.statusCode === 502) {
                retryCount++;
                console.log(`Received error 502. Retrying (${retryCount}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, backoffDelayMs));
            } else if (error.statusCode === 429) {
                retryCount++;
                console.log(`Received error 429. Retrying (${retryCount}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, backoffDelayRateLimit));
            } else {
                throw error;
            }
        }
    }
    throw new Error(`Failed after ${maxRetries} retries. Original error: ${error.message}`);
}
