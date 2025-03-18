import cron from 'node-cron';

// Export an empty initialization function since we no longer need cron jobs
export const initCronJobs = () => {
    console.log("✅ No global cron jobs to initialize - using per-order scanning instead");
};