const fs = require('fs');

const logPath = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\c2353522-af50-4c62-9a80-cdd6c78b3a30\\.system_generated\\logs\\transcript_full.jsonl';
const lines = fs.readFileSync(logPath, 'utf8').split('\n');

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.source === 'SYSTEM' && obj.content) {
            // Check if it's the output of view_file or similar that contains the original page.js
            if (obj.content.includes('PREMIUM AURORA HERO') && obj.content.includes('export default function Home()')) {
                console.log("Found it!");
                // Try to extract the file content. Usually it's in a code block or just the raw output.
                fs.writeFileSync('extracted_page.js', obj.content, 'utf8');
                break;
            }
        }
    } catch (e) {
        // ignore
    }
}
