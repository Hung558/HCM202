import nhaRongImg from './images/image.png'
import yeuSachImg from './images/yeu_sach_an_nam_1919.png'
import daiHoiToursImg from './images/dai_hoi_tours_1920_goc.jpg'
import biemHoaLePariaImg from './images/tranh_biem_hoa_le_paria.jpg'
import banAnImg from './images/ban_an_thuc_dan_1925.jpg'
import duongKachMenhImg from './images/duong_kach_menh_1927.jpg'
import giaiPhongQuanImg from './images/giai_phong_quan_1944.jpg'
import quangTruongBaDinhImg from './images/quang_truong_ba_dinh_1945.jpg'
import khangChienDongKheImg from './images/ho_chi_minh_dong_khe_1950.jpg'
import dienBienPhuImg from './images/dien_bien_phu_1954.jpg'
import hoChiMinhDocLoiKeuGoiImg from './images/ho_chi_minh_1967_anefo.jpg'
import diChuc1969Img from './images/di_chuc_ho_chi_minh_1969.png'

// Bản đồ liên kết ảnh tư liệu lịch sử chuẩn xác 100% theo ID sự kiện
const IMAGE_MAP = {
  'ev-04': nhaRongImg,              // 05/06/1911: Bác rời Bến cảng Nhà Rồng
  'ev-08': yeuSachImg,              // 18/06/1919: Bản Yêu sách của nhân dân An Nam tại Versailles
  'ev-10': daiHoiToursImg,          // 12/1920: Nguyễn Ái Quốc phát biểu tại Đại hội Tours (ảnh gốc TTXVN)
  'ev-12': biemHoaLePariaImg,       // 1922: Tranh châm biếm do Bác vẽ trên báo Le Paria (Người cùng khổ)
  'ev-13': banAnImg,                // 1925: Tác phẩm Bản án chế độ thực dân Pháp (Le Procès de la colonisation française)
  'ev-14': duongKachMenhImg,        // 1927: Bìa gốc tác phẩm Đường Kách mệnh
  'ev-22': giaiPhongQuanImg,        // 1944: Đội Việt Nam Tuyên truyền Giải phóng quân (Võ Nguyên Giáp & 34 chiến sĩ)
  'ev-24': quangTruongBaDinhImg,    // 02/09/1945: Lễ đài Độc lập tại Quảng trường Ba Đình
  'ev-25': khangChienDongKheImg,    // 1946 - 1950: Kháng chiến toàn quốc & Bác Hồ quan sát mặt trận Đông Khê 1950
  'ev-26': dienBienPhuImg,          // 1954: Cờ Quyết chiến Quyết thắng trên nóc hầm De Castries - Điện Biên Phủ
  'ev-27': hoChiMinhDocLoiKeuGoiImg,// 1966: Chủ tịch Hồ Chí Minh đọc Lời kêu gọi chống Mỹ 'Không có gì quý hơn độc lập tự do'
  'ev-28': diChuc1969Img            // 1969: Bút tích Di chúc lịch sử viết tay ngày 10/5/1969 của Chủ tịch Hồ Chí Minh
}

/**
 * Trả về asset ảnh tư liệu lịch sử cho sự kiện
 * @param {Object} event Sự kiện từ data.json
 * @returns {string|null} URL ảnh được Vite bundle
 */
export function getEventImage(event) {
  if (!event) return null
  if (IMAGE_MAP[event.id]) {
    return IMAGE_MAP[event.id]
  }
  return null
}
