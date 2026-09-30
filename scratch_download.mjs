import fs from 'fs';
import path from 'path';

// Danh sách các URL ảnh tư liệu lịch sử Việt Nam
const sources = [
  {
    name: 'dai_hoi_tours_1920.jpg',
    url: 'https://file3.qdnd.vn/data/images/0/2020/12/24/vuminh/dh%20tua.jpg'
  },
  {
    name: 'bao_le_paria_1922.jpg',
    url: 'https://file3.qdnd.vn/data/images/0/2022/03/31/vuminh/bia%20so%201%20bao%20nguoi%20cung%20kho.jpg'
  },
  {
    name: 'duong_kach_menh_1927.jpg',
    url: 'https://file3.qdnd.vn/data/images/0/2017/02/16/vuminh/dkm.jpg'
  },
  {
    name: 'tuyen_ngon_doc_lap_1945.jpg',
    url: 'https://file3.qdnd.vn/data/images/0/2020/09/01/vuminh/doc%20tuyen%20ngon.jpg'
  },
  {
    name: 'bac_ve_pac_bo_1941.jpg',
    url: 'https://file3.qdnd.vn/data/images/0/2021/01/27/vuminh/bac%20o%20pac%20bo.jpg'
  },
  {
    name: 'dien_bien_phu_1954.jpg',
    url: 'https://file3.qdnd.vn/data/images/0/2019/05/06/vuminh/bac%20va%20dai%20tuong.jpg'
  }
];

const destDir = path.resolve('src/chapters/chuong2/images');

async function run() {
  for (const item of sources) {
    const dest = path.join(destDir, item.name);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      if (!res.ok) {
        console.log(`Failed ${item.name}: ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`Success ${item.name}: ${buffer.length} bytes`);
    } catch (err) {
      console.log(`Error ${item.name}: ${err.message}`);
    }
  }
}

run();
