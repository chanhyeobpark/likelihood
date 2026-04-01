export const SITE_NAME = 'likelihood'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const FREE_SHIPPING_THRESHOLD = 100000 // 10만원 이상 무료배송
export const DEFAULT_SHIPPING_FEE = 3000 // 기본 배송비 3,000원

export const TIER_THRESHOLDS = {
  STANDARD: 0,
  SILVER: 300000,
  GOLD: 1000000,
  VIP: 3000000,
} as const

export const TIER_BENEFITS = {
  STANDARD: { pointsRate: 0.01, freeShippingThreshold: FREE_SHIPPING_THRESHOLD },
  SILVER: { pointsRate: 0.02, freeShippingThreshold: 50000 },
  GOLD: { pointsRate: 0.03, freeShippingThreshold: 0 },
  VIP: { pointsRate: 0.05, freeShippingThreshold: 0 },
} as const

export const ORDER_STATUS_MAP = {
  PENDING_PAYMENT: { ko: '결제대기', en: 'Pending Payment' },
  PAID: { ko: '결제완료', en: 'Paid' },
  PREPARING: { ko: '배송준비중', en: 'Preparing' },
  SHIPPED: { ko: '배송중', en: 'Shipped' },
  DELIVERED: { ko: '배송완료', en: 'Delivered' },
  CANCELLED: { ko: '주문취소', en: 'Cancelled' },
  REFUND_REQUESTED: { ko: '환불요청', en: 'Refund Requested' },
  REFUNDED: { ko: '환불완료', en: 'Refunded' },
} as const

export const SHIPPING_MEMOS = [
  '문 앞에 놓아주세요',
  '경비실에 맡겨주세요',
  '배송 전 연락 부탁드립니다',
  '부재 시 문 앞에 놓아주세요',
  '직접 입력',
] as const

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'] as const

export const SORT_OPTIONS = [
  { value: 'newest', labelKo: '신상품순', labelEn: 'Newest' },
  { value: 'price_asc', labelKo: '낮은 가격순', labelEn: 'Price: Low to High' },
  { value: 'price_desc', labelKo: '높은 가격순', labelEn: 'Price: High to Low' },
  { value: 'popular', labelKo: '인기순', labelEn: 'Popular' },
] as const
