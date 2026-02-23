import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();

  const discountRate = product.discountRate || product.discount || 0;
  const finalPrice = discountRate > 0
    ? Math.floor(product.price * (1 - discountRate / 100))
    : product.price;

  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/products/${product.productId}`)}>
      <div className="relative aspect-[3/4] bg-[#F4F4F4] overflow-hidden mb-4 border border-[#E5E0D8]">
        {product.image && product.image !== "IMG" ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#CCC] font-serif tracking-widest group-hover:scale-105 transition">IMAGE</div>
        )}

        {/* 할인율 뱃지 */}
        {discountRate > 0 && (
          <div className="absolute top-0 left-0 bg-[#997B4D] text-white text-[10px] font-bold px-3 py-1.5 tracking-wider">
            -{discountRate}%
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/50 to-transparent">
          <button className="w-full py-3 bg-white text-[#2C2C2C] text-xs font-bold tracking-widest hover:bg-[#2C2C2C] hover:text-white transition">QUICK VIEW</button>
        </div>
      </div>
      <div className="text-center px-2">
        <h4 className="font-bold text-[#997B4D] text-xs uppercase tracking-widest mb-1">{product.brand || product.brandName}</h4>
        <p className="text-sm text-[#4A4540] mb-2 font-medium truncate">{product.name}</p>
        <div className="flex items-center justify-center gap-2 font-serif text-[#2C2C2C]">
          {/* 할인이 있을 경우: 원가(취소선) + 할인가 / 없을 경우: 원가만 */}
          {discountRate > 0 ? (
            <>
              <span className="text-base font-bold text-red-500">{finalPrice.toLocaleString()}원</span>
              <span className="text-xs text-[#999] line-through decoration-1">{product.price?.toLocaleString()}원</span>
            </>
          ) : (
            <span className="text-base font-bold">{product.price?.toLocaleString()}원</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;