/**
 * Run this snippet in your browser console to clear the storage
 * if you are stuck with "QuotaExceeded" error.
 */
try {
    localStorage.clear();
    console.log("Local Storage Cleared Successfully!");
    alert("System Storage reset. Please clean-refresh the page.");
    window.location.reload();
} catch (e) {
    console.error(e);
}
