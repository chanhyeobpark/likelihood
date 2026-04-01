"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_FEE, SHIPPING_MEMOS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("TOSS");
  const [shippingMemo, setShippingMemo] = useState("");
  const [customMemo, setCustomMemo] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    postalCode: "",
    address1: "",
    address2: "",
    email: "",
  });

  useEffect(() => {
    setMounted(true);
    // Load user info if logged in
    const loadUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        if (profile) {
          setForm((f) => ({
            ...f,
            name: profile.full_name || "",
            phone: profile.phone || "",
            email: profile.email,
          }));
        }
        // Load default address
        if (profile?.default_address_id) {
          const { data: addr } = await supabase.from("addresses").select("*").eq("id", profile.default_address_id).single();
          if (addr) {
            setForm((f) => ({
              ...f,
              name: addr.recipient_name,
              phone: addr.phone,
              postalCode: addr.postal_code,
              address1: addr.address_line1,
              address2: addr.address_line2 || "",
            }));
          }
        }
      }
    };
    loadUser();
  }, []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="container-wide py-20 text-center">
        <p className="text-sm text-gray-400">장바구니가 비어있습니다</p>
      </div>
    );
  }

  const openDaumPostcode = () => {
    // @ts-ignore - Daum Postcode API loaded via script
    if (typeof daum === "undefined") {
      toast.error("주소 검색을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    // @ts-ignore
    new daum.Postcode({
      oncomplete: (data: any) => {
        setForm((f) => ({
          ...f,
          postalCode: data.zonecode,
          address1: data.roadAddress || data.jibunAddress,
        }));
      },
    }).open();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.postalCode || !form.address1) {
      toast.error("배송 정보를 모두 입력해주세요");
      return;
    }
    setLoading(true);

    try {
      const memo = shippingMemo === "직접 입력" ? customMemo : shippingMemo;

      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          shipping: { ...form, memo },
          paymentMethod,
          couponCode: couponCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "주문 생성에 실패했습니다");
        setLoading(false);
        return;
      }

      if (paymentMethod === "TOSS") {
        // Toss Payments redirect
        // @ts-ignore
        const tossPayments = await window.TossPayments(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
        await tossPayments.requestPayment("카드", {
          amount: data.total,
          orderId: data.orderNumber,
          orderName: `likelihood 주문 (${items.length}개)`,
          customerName: form.name,
          successUrl: `${window.location.origin}/checkout/success?orderId=${data.orderId}`,
          failUrl: `${window.location.origin}/checkout/fail?orderId=${data.orderId}`,
        });
      } else {
        // Stripe
        const stripeRes = await fetch("/api/payment/stripe/intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderId }),
        });
        const stripeData = await stripeRes.json();
        // Redirect to Stripe checkout or use Elements
        router.push(`/checkout/stripe?clientSecret=${stripeData.clientSecret}&orderId=${data.orderId}`);
      }
    } catch (err) {
      toast.error("결제 처리 중 오류가 발생했습니다");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Daum Postcode Script */}
      <script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" async />

      <div className="container-wide py-12">
        <h1 className="text-2xl font-light tracking-wider mb-8">결제</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12">
            {/* Left: Form */}
            <div className="space-y-8">
              {/* Shipping Info */}
              <div>
                <h2 className="text-xs font-medium tracking-wider uppercase mb-4">배송 정보</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">수령인</Label>
                      <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required className="mt-1 rounded-none h-11" />
                    </div>
                    <div>
                      <Label className="text-xs">연락처</Label>
                      <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="010-0000-0000" required className="mt-1 rounded-none h-11" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">이메일</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="mt-1 rounded-none h-11" />
                  </div>
                  <div>
                    <Label className="text-xs">주소</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={form.postalCode} readOnly placeholder="우편번호" className="rounded-none h-11 w-32" />
                      <Button type="button" variant="outline" onClick={openDaumPostcode} className="rounded-none h-11 text-xs">
                        주소 검색
                      </Button>
                    </div>
                    <Input value={form.address1} readOnly placeholder="도로명 주소" className="mt-2 rounded-none h-11" />
                    <Input value={form.address2} onChange={(e) => setForm((f) => ({ ...f, address2: e.target.value }))} placeholder="상세 주소" className="mt-2 rounded-none h-11" />
                  </div>
                  <div>
                    <Label className="text-xs">배송 메모</Label>
                    <Select value={shippingMemo} onValueChange={(v) => setShippingMemo(v ?? "")}>
                      <SelectTrigger className="mt-1 rounded-none h-11">
                        <SelectValue placeholder="배송 메모 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {SHIPPING_MEMOS.map((memo) => (
                          <SelectItem key={memo} value={memo}>{memo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {shippingMemo === "직접 입력" && (
                      <Input value={customMemo} onChange={(e) => setCustomMemo(e.target.value)} placeholder="배송 메모를 입력하세요" className="mt-2 rounded-none h-11" />
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <h2 className="text-xs font-medium tracking-wider uppercase mb-4">결제 수단</h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center gap-3 p-4 border cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="TOSS" id="toss" />
                    <label htmlFor="toss" className="text-sm cursor-pointer flex-1">
                      <span className="font-medium">토스페이먼츠</span>
                      <span className="text-xs text-gray-400 ml-2">카드, 계좌이체, 간편결제</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3 p-4 border cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="STRIPE" id="stripe" />
                    <label htmlFor="stripe" className="text-sm cursor-pointer flex-1">
                      <span className="font-medium">International Payment</span>
                      <span className="text-xs text-gray-400 ml-2">Visa, Mastercard, Apple Pay</span>
                    </label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:sticky lg:top-32 h-fit">
              <div className="bg-gray-50 p-6">
                <h2 className="text-xs font-medium tracking-wider uppercase mb-4">주문 상품</h2>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex justify-between text-sm">
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.productNameKo}</p>
                        <p className="text-xs text-gray-400">{item.variantLabel} x {item.quantity}</p>
                      </div>
                      <p className="ml-4 flex-shrink-0">{formatPrice(item.unitPrice * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Coupon */}
                <div className="mb-4">
                  <Label className="text-xs">쿠폰 코드</Label>
                  <div className="flex gap-2 mt-1">
                    <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="쿠폰 코드 입력" className="rounded-none h-9 text-sm" />
                    <Button type="button" variant="outline" size="sm" className="rounded-none text-xs h-9">
                      적용
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">소계</span><span>{formatPrice(subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">배송비</span><span>{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</span></div>
                  <Separator />
                  <div className="flex justify-between text-base font-medium pt-2">
                    <span>합계</span><span>{formatPrice(total)}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white hover:bg-gray-900 rounded-none h-12 text-sm tracking-wider uppercase mt-6"
                >
                  {loading ? "처리 중..." : `${formatPrice(total)} 결제하기`}
                </Button>

                <p className="text-[10px] text-gray-400 text-center mt-4 leading-relaxed">
                  주문 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
