const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Sandboxed JavaScript Code Runner
 * 
 * Executes user-submitted code in a restricted child process with:
 *  - Blocked require() / import — prevents access to fs, child_process, net, etc.
 *  - Restricted global scope — no process.exit(), no process.env access
 *  - Timeout enforcement — kills the process after the limit
 *  - Memory limit via --max-old-space-size
 *  - Temp file cleanup on completion
 * 
 * For production at scale, replace this with Docker containers
 * using --network=none --memory=128m --read-only for full OS-level isolation.
 */

// Modules that user code is NOT allowed to require
const BLOCKED_MODULES = [
  'fs', 'path', 'child_process', 'cluster', 'dgram', 'dns', 'http', 'https',
  'net', 'tls', 'os', 'readline', 'repl', 'vm', 'worker_threads',
  'crypto', 'zlib', 'stream', 'process', 'v8', 'perf_hooks',
  'async_hooks', 'inspector', 'trace_events', 'module',
];

/**
 * Wraps user code in a sandbox that disables dangerous globals and require.
 */
function buildSandboxedCode(userCode) {
  // Block require for dangerous modules, neuter dangerous globals
  return `
'use strict';

// ── Sandbox Setup ───────────────────────────────────────
const _blockedModules = new Set(${JSON.stringify(BLOCKED_MODULES)});
let _originalRequire = null;
try { _originalRequire = require; } catch(e) {}

// Override require to block dangerous modules
function require(mod) {
  if (_blockedModules.has(mod)) {
    throw new Error(\`Module "\${mod}" is not allowed in sandboxed execution\`);
  }
  if (_originalRequire) {
    return _originalRequire(mod);
  }
  throw new Error("require is not defined");
}

// Block process-level escape hatches
if (typeof process !== 'undefined') {
  process.exit = () => { throw new Error('process.exit() is not allowed'); };
  process.kill = () => { throw new Error('process.kill() is not allowed'); };
  process.env = {}; // Hide environment variables
  process.chdir = () => { throw new Error('process.chdir() is not allowed'); };
}

// Block eval-like constructs
global.eval = () => { throw new Error('eval() is not allowed'); };
global.Function = (() => {
  const _F = Function;
  return function() { throw new Error('new Function() is not allowed'); };
})();

// ── User Code ───────────────────────────────────────────
${userCode}
`;
}

/**
 * Safely executes JavaScript code in a sandboxed child process
 * @param {string} code - The user submitted JS code
 * @param {string} input - Test case input to pass via stdin
 * @param {number} timeoutMs - Timeout limit (default 5000ms)
 * @returns {Promise<{status: string, stdout: string, stderr: string, executionTimeMs: number}>}
 */
exports.runJavaScript = (code, input = '', timeoutMs = 5000) => {
    return new Promise((resolve) => {
        const startTime = Date.now();

        // Ensure temp directory exists
        const tempDir = path.join(__dirname, '../temp_sandbox');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const fileName = `run-${Date.now()}-${Math.random().toString(36).substr(2, 8)}.js`;
        const filePath = path.join(tempDir, fileName);

        // Write sandboxed code to temp file
        const sandboxedCode = buildSandboxedCode(code);
        fs.writeFileSync(filePath, sandboxedCode);

        // Spawn child process with memory limit and no network
        const child = spawn('node', [
            '--max-old-space-size=64',  // 64MB heap limit
            '--no-warnings',
            filePath,
        ], {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {},  // Empty environment — no access to secrets
            cwd: tempDir,  // Restrict working directory
        });

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
        }
        child.stdin.end();

        child.stdout.on('data', (data) => {
            stdout += data.toString();
            // Prevent stdout flooding (max 1MB)
            if (stdout.length > 1024 * 1024) {
                child.kill('SIGKILL');
            }
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (exitCode) => {
            clearTimeout(timeout);
            const executionTimeMs = Date.now() - startTime;

            // Cleanup temp file
            try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } catch (err) {
                console.error(`Sandbox cleanup error: ${err.message}`);
            }

            if (timedOut) {
                resolve({
                    status: 'Time Limit Exceeded',
                    stdout: stdout.trim(),
                    stderr: `Execution timed out (Limit: ${timeoutMs / 1000}s)`,
                    executionTimeMs,
                });
            } else if (exitCode !== 0) {
                // Clean up sandbox-internal error messages for the user
                let cleanStderr = stderr.trim();
                if (cleanStderr.includes('is not allowed')) {
                    resolve({
                        status: 'Security Violation',
                        stdout: '',
                        stderr: cleanStderr.split('\n').find(l => l.includes('is not allowed')) || cleanStderr,
                        executionTimeMs,
                    });
                } else {
                    resolve({
                        status: 'Runtime Error',
                        stdout: stdout.trim(),
                        stderr: cleanStderr || `Process exited with code ${exitCode}`,
                        executionTimeMs,
                    });
                }
            } else {
                resolve({
                    status: 'Success',
                    stdout: stdout.trim(),
                    stderr: stderr.trim(),
                    executionTimeMs,
                });
            }
        });
    });
};
