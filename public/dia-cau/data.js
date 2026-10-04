// Marker data: one entry per country (capital coordinates [lat, lng]).
// eventName / description / mediaUrl / references are left empty to be filled in later.
const COUNTRIES = [
    // Châu Á
    ['Châu Á', 'Việt Nam', 'Hà Nội', 21.0285, 105.8542],
    ['Châu Á', 'Trung Quốc', 'Bắc Kinh', 39.9042, 116.4074],
    ['Châu Á', 'Nhật Bản', 'Tokyo', 35.6762, 139.6503],
    ['Châu Á', 'Hàn Quốc', 'Seoul', 37.5665, 126.978],
    ['Châu Á', 'Triều Tiên', 'Bình Nhưỡng', 39.0392, 125.7625],
    ['Châu Á', 'Lào', 'Viêng Chăn', 17.9757, 102.6331],
    ['Châu Á', 'Campuchia', 'Phnôm Pênh', 11.5564, 104.9282],
    ['Châu Á', 'Thái Lan', 'Bangkok', 13.7563, 100.5018],
    ['Châu Á', 'Singapore', 'Singapore', 1.3521, 103.8198],
    ['Châu Á', 'Indonesia', 'Jakarta', -6.2088, 106.8456],
    ['Châu Á', 'Philippines', 'Manila', 14.5995, 120.9842],
    ['Châu Á', 'Ấn Độ', 'New Delhi', 28.6139, 77.209],
    ['Châu Á', 'Mông Cổ', 'Ulaanbaatar', 47.8864, 106.9057],
    ['Châu Á', 'Iran', 'Tehran', 35.6892, 51.389],
    ['Châu Á', 'Ả Rập Xê Út', 'Riyadh', 24.7136, 46.6753],
    ['Châu Á', 'Thổ Nhĩ Kỳ', 'Ankara', 39.9334, 32.8597],

    // Châu Âu
    ['Châu Âu', 'Nga', 'Moskva', 55.7558, 37.6173],
    ['Châu Âu', 'Pháp', 'Paris', 48.8566, 2.3522],
    ['Châu Âu', 'Anh', 'London', 51.5074, -0.1278],
    ['Châu Âu', 'Đức', 'Berlin', 52.52, 13.405],
    ['Châu Âu', 'Ý', 'Roma', 41.9028, 12.4964],
    ['Châu Âu', 'Tây Ban Nha', 'Madrid', 40.4168, -3.7038],
    ['Châu Âu', 'Ba Lan', 'Warszawa', 52.2297, 21.0122],
    ['Châu Âu', 'Ukraina', 'Kyiv', 50.4501, 30.5234],
    ['Châu Âu', 'Thụy Điển', 'Stockholm', 59.3293, 18.0686],
    ['Châu Âu', 'Na Uy', 'Oslo', 59.9139, 10.7522],
    ['Châu Âu', 'Hy Lạp', 'Athens', 37.9838, 23.7275],
    ['Châu Âu', 'Hungary', 'Budapest', 47.4979, 19.0402],

    // Châu Phi
    ['Châu Phi', 'Ai Cập', 'Cairo', 30.0444, 31.2357],
    ['Châu Phi', 'Algérie', 'Alger', 36.7538, 3.0588],
    ['Châu Phi', 'Maroc', 'Rabat', 34.0209, -6.8416],
    ['Châu Phi', 'Nigeria', 'Abuja', 9.0765, 7.3986],
    ['Châu Phi', 'Ethiopia', 'Addis Ababa', 8.9806, 38.7578],
    ['Châu Phi', 'Kenya', 'Nairobi', -1.2921, 36.8219],
    ['Châu Phi', 'Nam Phi', 'Pretoria', -25.7479, 28.2293],
    ['Châu Phi', 'Angola', 'Luanda', -8.839, 13.2894],
    ['Châu Phi', 'Sénégal', 'Dakar', 14.7167, -17.4677],

    // Bắc Mỹ
    ['Bắc Mỹ', 'Hoa Kỳ', 'Washington, D.C.', 38.9072, -77.0369],
    ['Bắc Mỹ', 'Canada', 'Ottawa', 45.4215, -75.6972],
    ['Bắc Mỹ', 'Mexico', 'Thành phố Mexico', 19.4326, -99.1332],
    ['Bắc Mỹ', 'Cuba', 'La Habana', 23.1136, -82.3666],

    // Nam Mỹ
    ['Nam Mỹ', 'Brazil', 'Brasília', -15.7939, -47.8828],
    ['Nam Mỹ', 'Argentina', 'Buenos Aires', -34.6037, -58.3816],
    ['Nam Mỹ', 'Chile', 'Santiago', -33.4489, -70.6693],
    ['Nam Mỹ', 'Peru', 'Lima', -12.0464, -77.0428],
    ['Nam Mỹ', 'Colombia', 'Bogotá', 4.711, -74.0721],
    ['Nam Mỹ', 'Venezuela', 'Caracas', 10.4806, -66.9036],

    // Châu Đại Dương
    ['Châu Đại Dương', 'Úc', 'Canberra', -35.2809, 149.13],
    ['Châu Đại Dương', 'New Zealand', 'Wellington', -41.2865, 174.7762],
    ['Châu Đại Dương', 'Papua New Guinea', 'Port Moresby', -9.4438, 147.1803],
].map(([continent, name, capital, lat, lng], i) => ({
    id: i + 1,
    continent,
    name,
    capital,
    coordinates: [lat, lng],
    eventName: '',
    description: '',
    mediaUrl: [],
    references: [],
}));

// Quần đảo của Việt Nam, shown on the globe but not listed as separate countries
const TERRITORIES = [
    { name: 'Hoàng Sa (Việt Nam)', coordinates: [16.5, 112.0] },
    { name: 'Trường Sa (Việt Nam)', coordinates: [10.0, 114.3] },
];
