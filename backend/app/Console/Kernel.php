<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Run monthly payment check on the 1st of every month at 2 AM
        $schedule->command('payments:check-monthly')
                 ->monthlyOn(1, '02:00')
                 ->withoutOverlapping()
                 ->runInBackground();
        
        // Optional: Run a daily check to catch users who fall behind mid-month
        $schedule->command('payments:check-monthly')
                 ->daily()
                 ->at('03:00')
                 ->withoutOverlapping()
                 ->runInBackground();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
