import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ChevronRight, AlertCircle, ShieldCheck } from 'lucide-react';
import axios from 'axios';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('로그인이 필요한 서비스입니다.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8080/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data && response.data.data) {
        setCartItems(response.data.data);
      }
    } catch (error) {
      console.error('장바구니 조회 오류:', error);
      alert('장바구니 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (cartItemId) => {
    if (!window.confirm('장바구니에서 이 상품을 삭제하시겠습니까?')) return;

    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`http://localhost:8080/api/cart/${cartItemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
      window.location.reload();
    } catch (error) {
      console.error('장바구니 삭제 오류:', error);
      alert('상품 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleGoToProduct = (productId) => {
    console.log("장바구니에서 클릭한 상품 ID:", productId);

    if (!productId) {
      alert("상품 정보가 올바르지 않습니다.");
      return;
    }

    navigate(`/products/${productId}`);
  };

  // 💡 [S3 이미지 처리 로직 추가]
  // DB에 파일명(Key)만 저장되어 있을 경우를 대비한 헬퍼 함수
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path; // 이미 전체 URL인 경우 통과

    // TODO: 본인의 S3 버킷 주소나 CloudFront 도메인으로 변경하세요.
    const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || 'https://your-bucket-name.s3.ap-northeast-2.amazonaws.com';
    return `${S3_BASE_URL}/${path.startsWith('/') ? path.slice(1) : path}`;
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.count), 0);

  if (loading) {
    return <div className="py-32 text-center text-[#888] font-sans">장바구니 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans animate-fade-in">
      <h1 className="text-3xl font-serif font-bold text-[#2C2C2C] mb-10 tracking-wide">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center border-t border-b border-[#E5E0D8] bg-[#FDFBF7]/50">
          <ShoppingBag size={48} className="text-[#D1C9C0] mb-6" strokeWidth={1} />
          <h2 className="text-lg text-[#2C2C2C] font-bold mb-2">장바구니에 담긴 상품이 없습니다.</h2>
          <p className="text-[#888] text-sm mb-8">ONEPICK LUX의 다양한 중고 명품을 만나보세요.</p>
          <Link to="/products" className="px-8 py-3 bg-[#2C2C2C] text-white text-sm font-bold tracking-widest hover:bg-[#444] transition shadow-md">
            쇼핑 계속하기
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-12">

          <div className="flex-1">
            <div className="border-t-2 border-[#2C2C2C]">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="flex gap-6 py-6 border-b border-[#E5E0D8] relative group">

                  {/* 💡 함수 연결 */}
                  <div
                    className="w-32 h-32 bg-[#F4F4F4] shrink-0 cursor-pointer rounded-sm overflow-hidden"
                    onClick={() => handleGoToProduct(item.productId)}
                  >
                    {/* 💡 [수정] getImageUrl 함수 적용 */}
                    {item.thumbnailUrl ? (
                      <img src={getImageUrl(item.thumbnailUrl)} alt={item.productName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#CCC] font-serif text-sm">NO IMAGE</div>
                    )}
                  </div>

                  <div className="flex flex-col flex-1 py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[#997B4D] font-bold text-xs tracking-widest mb-1.5">{item.brandName}</p>

                        {/* 💡 함수 연결 */}
                        <p
                          className="text-[#2C2C2C] text-lg font-medium cursor-pointer hover:underline decoration-[#E5E0D8] underline-offset-4"
                          onClick={() => handleGoToProduct(item.productId)}
                        >
                          {item.productName}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteItem(item.cartItemId)}
                        className="p-2 text-[#CCC] hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={20} strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                      <div className="text-sm text-[#888] bg-[#FDFBF7] px-3 py-1.5 border border-[#E5E0D8] rounded-sm">
                        수량: <span className="font-bold text-[#5C5550]">{item.count}</span>개
                      </div>
                      <div className="text-xl font-serif font-bold text-[#2C2C2C]">
                        {item.price.toLocaleString()}<span className="text-base font-sans font-normal ml-1">원</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-[#888] bg-gray-50 p-4 rounded-sm border border-gray-100">
              <ShieldCheck size={18} className="text-[#997B4D]" />
              <span>장바구니에 담긴 상품은 결제 완료 전까지 다른 고객이 구매할 수 있습니다.</span>
            </div>
          </div>

          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-[#FDFBF7] border border-[#E5E0D8] p-6 sticky top-28 rounded-sm shadow-sm">
              <h3 className="text-lg font-serif font-bold text-[#2C2C2C] border-b border-[#E5E0D8] pb-4 mb-6">Order Summary</h3>

              <div className="space-y-4 text-sm text-[#5C5550] mb-6">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span className="font-bold">{totalPrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span className="font-bold text-[#997B4D]">무료</span>
                </div>
              </div>

              <div className="border-t border-[#E5E0D8] pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-[#2C2C2C]">총 결제 금액</span>
                  <span className="text-2xl font-serif font-bold text-red-500">
                    {totalPrice.toLocaleString()}<span className="text-lg ml-1 font-sans">원</span>
                  </span>
                </div>
              </div>

              <button className="w-full bg-[#2C2C2C] text-white py-4 font-bold tracking-widest hover:bg-[#444] transition flex items-center justify-center gap-2 shadow-md">
                CHECKOUT <ChevronRight size={18} />
              </button>

              <p className="text-xs text-center text-[#999] mt-4 flex items-center justify-center gap-1">
                <AlertCircle size={12} /> 안전 결제 서비스가 적용됩니다.
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CartPage;