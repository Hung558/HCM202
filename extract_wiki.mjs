import fs from 'fs';

const p = 'C:\\Users\\admin\\.gemini\\antigravity-ide\\brain\\52cf73b6-2df2-496f-ab76-d58fa71c8651\\.system_generated\\steps\\181\\content.md';
const content = fs.readFileSync(p, 'utf8');

const regex = /(?:https:)?\/\/[^\s"'<>]+\.(?:jpg|png|webp|gif)/gi;
const matches = [...new Set(content.match(regex) || [])];
console.log('Total matches:', matches.length);
for (const m of matches) {
  if (m.includes('thumb') || m.includes('upload') || m.includes('wiki')) {
    console.log(m);
  }
}
