// Ô đỏ có ngôi sao vàng — logo HCM Web (trang chủ, cuốn sách "Vào học", footer)
const STAR = {
  clipPath: 'polygon(50% 0%,61.8% 35.3%,100% 35.3%,69.1% 57.1%,80.9% 92.7%,50% 70.9%,19.1% 92.7%,30.9% 57.1%,0% 35.3%,38.2% 35.3%)',
}

export default function StarLogo({ size = 'size-[38px]', star = 'size-5', radius = 'rounded-[10px]' }) {
  return (
    <span className={`grid shrink-0 place-items-center bg-primary ${size} ${radius}`}>
      <span className={`bg-gold ${star}`} style={STAR} />
    </span>
  )
}
