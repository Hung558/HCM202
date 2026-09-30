import fs from 'fs';
import path from 'path';

const pages = [
  'https://vi.wikipedia.org/wiki/%C4%90%C6%B0%E1%BB%9Dng_k%C3%A1ch_m%E1%BB%87nh',
  'https://vi.wikipedia.org/wiki/Tuy%C3%AAn_ng%C3%B4n_%C4%91%E1%BB%99c_l%E1%BA%ADp_Vi%E1%BB%87t_Nam',
  'https://vi.wikipedia.org/wiki/B%E1%BA%A3n_%C3%A1n_ch%E1%BA%BF_%C4%91%E1%BB%99_th%E1%BB%B1c_d%C3%A2n_Ph%C3%A1p',
  'https://vi.wikipedia.org/wiki/Chi%E1%BA%BFn_d%E1%BB%8Bch_%C4%90i%E1%BB%87n_Bi%C3%AAn_Ph%E1%BB%A7',
  'https://vi.wikipedia.org/wiki/Di_ch%C3%BAc_H%E1%BB%93_Ch%C3%AD_Minh',
  'https://vi.wikipedia.org/wiki/Vi%E1%BB%87t_Nam_Tuy%C3%AAn_truy%E1%BB%81n_Gi%E1%BA%A3i_ph%C3%B3ng_qu%C3%A2n'
];

async function findImages() {
  const allImages = [];
  for (const url of pages) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } });
      const html = await res.text();
      const regex = /\/\/(?:upload|thumb)\.wikimedia\.org\/[^\s"'<>]+\.(?:jpg|png|webp)/gi;
      const matches = [...new Set(html.match(regex) || [])];
      console.log('Page:', decodeURIComponent(url.split('/').pop()), 'found images:', matches.length);
      matches.forEach(m => {
        if (!m.includes('logo') && !m.includes('icon') && !m.includes('Red_flag') && !m.includes('Ambox')) {
          allImages.push({ page: decodeURIComponent(url.split('/').pop()), url: 'https:' + m });
        }
      });
    } catch (e) {
      console.log('Error page:', url, e.message);
    }
  }

  console.log('\n--- Selected Historical Images ---');
  allImages.slice(0, 30).forEach(img => console.log(img.page, '->', img.url));
  fs.writeFileSync('found_images.json', JSON.stringify(allImages, null, 2));
}

findImages();
