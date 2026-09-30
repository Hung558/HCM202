import fs from 'fs';
import path from 'path';

const downloadList = [
  {
    name: 'ban_an_thuc_dan_1925.jpg',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Le_Proc%C3%A8s_de_la_Colonisation_Fran%C3%A7aise.jpg/500px-Le_Proc%C3%A8s_de_la_Colonisation_Fran%C3%A7aise.jpg'
  },
  {
    name: 'duong_kach_menh_1927.jpg',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Duongkachmenh.jpg/500px-Duongkachmenh.jpg'
  },
  {
    name: 'giai_phong_quan_1944.jpg',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/Vo_Nguyen_Giap%2C_Vietminh_forces%2C_1944.jpg/960px-Vo_Nguyen_Giap%2C_Vietminh_forces%2C_1944.jpg'
  },
  {
    name: 'dien_bien_phu_1954.jpg',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ae/Victory_in_Battle_of_Dien_Bien_Phu.jpg/500px-Victory_in_Battle_of_Dien_Bien_Phu.jpg'
  }
];

const destDir = path.resolve('src/chapters/chuong2/images');

async function downloadAll() {
  for (const item of downloadList) {
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
        console.log('Saved successfully:', item.name, buffer.length, 'bytes');
      }
    } catch (e) {
      console.log('Error downloading', item.name, e.message);
    }
  }
}

downloadAll();
