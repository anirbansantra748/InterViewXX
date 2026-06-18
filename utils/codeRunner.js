const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Safely executes JavaScript code in a child process
 * @param {string} code - The user submitted JS code
 * @param {string} input - Test case input to pass via stdin
 * @param {number} timeoutMs - Timeout limit (default 2000ms)
 * @returns {Promise<{status: string, stdout: string, stderr: string}>}
 */
exports.runJavaScript = (code, input = '', timeoutMs = 2000) => {
    return new Promise((resolve) => {
        // Ensure temp directory exists
        const tempDir = path.join(__dirname, '../public/temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const fileName = `runner-${Date.now()}-${Math.random().toString(36).substr(2, 5)}.js`;
        const filePath = path.join(tempDir, fileName);

        // Write candidate code to temp file
        fs.writeFileSync(filePath, code);

        // Spawn child node process
        const child = spawn('node', [filePath]);
        
        let stdout = '';
        let stderr = '';
        let timedOut = false;

        // Force terminate after timeout
        const timeout = setTimeout(() => {
            timedOut = true;
            child.kill('SIGKILL');
        }, timeoutMs);

        // Write input to stdin
        if (input) {
            child.stdin.write(input);
            child.stdin.end();
        }

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (exitCode) => {
            clearTimeout(timeout);
            
            // Cleanup temp file
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (err) {
                console.error(`Error deleting temp file ${filePath}:`, err.message);
            }

            if (timedOut) {
                resolve({
                    status: 'Time Limit Exceeded',
                    stdout: stdout.trim(),
                    stderr: 'Execution timed out (Limit: 2s)'
                });
            } else if (exitCode !== 0) {
                resolve({
                    status: 'Runtime Error',
                    stdout: stdout.trim(),
                    stderr: stderr.trim() || `Process exited with code ${exitCode}`
                });
            } else {
                resolve({
                    status: 'Success',
                    stdout: stdout.trim(),
                    stderr: stderr.trim()
                });
            }
        });
    });
};
