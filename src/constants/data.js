import { Shield, CheckCircle, Truck, Calculator, Coins, Camera } from 'lucide-react';

export const BANNER_DATA = [
  { id: 1, title: "Grand Opening", desc: "수수료 0원, 프리미엄 위탁의 시작", color: "bg-[#8B7355]", textColor: "text-white" },
  { id: 2, title: "Vintage Chanel", desc: "시간이 흘러도 변하지 않는 가치", color: "bg-[#2C2C2C]", textColor: "text-[#D4AF37]" },
  { id: 3, title: "Autumn Collection", desc: "가을을 준비하는 가장 완벽한 방법", color: "bg-[#A68A64]", textColor: "text-white" },
  { id: 4, title: "High-End Watch", desc: "전문 감정사가 보증하는 정품", color: "bg-[#4A4540]", textColor: "text-gray-200" },
  { id: 5, title: "Luxury Archive", desc: "구하기 힘든 희귀템 모음전", color: "bg-[#967259]", textColor: "text-white" },
];

export const CATEGORIES = [
  { id: 1, name: "가방", icon: "👜", desc: "Classic & Trendy Bags" },
  { id: 2, name: "의류", icon: "🧥", desc: "Premium Apparel" },
  { id: 3, name: "주얼리", icon: "💍", desc: "Timeless Jewelry" },
  { id: 4, name: "신발", icon: "👠", desc: "Luxury Shoes" },
  { id: 5, name: "지갑", icon: "👛", desc: "Wallets & Small Goods" },
  { id: 6, name: "악세서리", icon: "🕶️", desc: "Scarves & Eyewear" },
];

export const INITIAL_BRANDS = [
  { id: 1, name: "Hermès", isLiked: true },
  { id: 2, name: "Chanel", isLiked: false },
  { id: 3, name: "Rolex", isLiked: true },
  { id: 4, name: "Louis Vuitton", isLiked: false },
  { id: 5, name: "Dior", isLiked: false },
  { id: 6, name: "Cartier", isLiked: false },
  { id: 7, name: "Prada", isLiked: false },
  { id: 8, name: "Gucci", isLiked: false },
  { id: 9, name: "Burberry", isLiked: false },
  { id: 10, name: "Fendi", isLiked: false },
  { id: 11, name: "Bottega Veneta", isLiked: false },
  { id: 12, name: "Saint Laurent", isLiked: false },
  { id: 13, name: "Celine", isLiked: false },
  { id: 14, name: "Balenciaga", isLiked: false },
  { id: 15, name: "Valentino", isLiked: false },
  { id: 16, name: "Goyard", isLiked: false },
];

export const MOCK_PRODUCTS = Array(12).fill(null).map((_, i) => ({
  id: i,
  brand: INITIAL_BRANDS[i % INITIAL_BRANDS.length].name,
  name: `Premium Collection Item ${i + 1}`,
  price: (i + 1) * 450000 + 100000,
  discount: i % 3 === 0 ? 5 : 0,
  image: "PRODUCT IMG",
  isHot: i < 4,
  description: "이 상품은 전문 감정사의 검수를 마친 100% 정품입니다. 미세한 사용감이 있을 수 있으나 전체적으로 매우 양호한 상태를 유지하고 있습니다."
}));