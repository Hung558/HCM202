import fs from 'fs';
import path from 'path';

const testUrls = [
  {
    name: 'ho_chi_minh_1946.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Ho_Chi_Minh_1946.jpg'
  },
  {
    name: 'ho_chi_minh_portrait_1946.jpg',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Ho_Chi_Minh_-_1946_Portrait.jpg/960px-Ho_Chi_Minh_-_1946_Portrait.jpg'
  },
  {
    name: 'ho_chi_minh_1964.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/vi/c/ce/Ho_Chi_Minh_1964.jpg'
  }
];

const destDir = path.resolve('src/chapters/chuong2/images');

async function test() {
  for (const item of testUrls) {
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log(item.name, 'status:', res.status);
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer());
        const dest = path.join(destDir, item.name);
        fs.writeFileSync(dest, buffer);
        console.log('Saved:', item.name, buffer.length, 'bytes');
      }
    } catch (e) {
      console.log(item.name, 'error:', e.message);
    }
  }
}

test();
