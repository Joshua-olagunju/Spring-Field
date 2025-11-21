/**
 * Payment Logs Viewer
 * Displays all payment logs from localStorage
 * 
 * To use: Open browser console and run:
 * > viewPaymentLogs()
 * 
 * Or add this to your page temporarily to see logs in UI
 */

// Function to view logs in console
window.viewPaymentLogs = function() {
    const logs = JSON.parse(localStorage.getItem('payment_logs') || '[]');
    
    console.clear();
    console.log('═══════════════════════════════════════════════');
    console.log('           PAYMENT LOGS VIEWER');
    console.log('═══════════════════════════════════════════════');
    console.log(`Total Entries: ${logs.length}`);
    console.log('═══════════════════════════════════════════════\n');
    
    if (logs.length === 0) {
        console.log('❌ No payment logs found.');
        console.log('\n💡 Logs are automatically saved during payment process.');
        return;
    }
    
    logs.forEach((log, index) => {
        console.log(`\n[${index + 1}] ${log.timestamp}`);
        console.log(`📝 ${log.message}`);
        if (log.data) {
            console.log('   Data:', log.data);
        }
        console.log('---');
    });
    
    console.log('\n═══════════════════════════════════════════════');
    console.log('           END OF LOGS');
    console.log('═══════════════════════════════════════════════');
    
    return logs;
};

// Function to clear logs
window.clearPaymentLogs = function() {
    localStorage.removeItem('payment_logs');
    console.log('✅ Payment logs cleared!');
};

// Function to download logs as JSON
window.downloadPaymentLogs = function() {
    const logs = JSON.parse(localStorage.getItem('payment_logs') || '[]');
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `payment-logs-${new Date().toISOString()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    console.log('✅ Payment logs downloaded!');
};

console.log('💡 Payment Log Helpers Loaded!');
console.log('   - viewPaymentLogs()     : View all logs in console');
console.log('   - clearPaymentLogs()    : Clear all logs');
console.log('   - downloadPaymentLogs() : Download logs as JSON');
