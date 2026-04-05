"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Script from "next/script";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: "", phone: "", email: "" });
  const [address, setAddress] = useState({ postal_code: "", address1: "", address2: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setProfile({ full_name: data.full_name || "", phone: data.phone || "", email: data.email });
      }
      // Load default address
      if (data?.default_address_id) {
        const { data: addr } = await supabase.from("addresses").select("*").eq("id", data.default_address_id).single();
        if (addr) {
          setAddress({ postal_code: addr.postal_code, address1: addr.address_line1, address2: addr.address_line2 || "" });
        }
      } else if (user) {
        // Try to find any address
        const { data: addrs } = await supabase.from("addresses").select("*").eq("user_id", user.id).limit(1);
        if (addrs && addrs.length > 0) {
          setAddress({ postal_code: addrs[0].postal_code, address1: addrs[0].address_line1, address2: addrs[0].address_line2 || "" });
        }
      }
      setLoading(false);
    };
    load();
  }, [router]);

  const openDaumPostcode = () => {
    // @ts-ignore
    if (typeof daum === "undefined") {
      toast.error("주소 검색을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    // @ts-ignore
    new daum.Postcode({
      oncomplete: (data: any) => {
        setAddress((a) => ({
          ...a,
          postal_code: data.zonecode,
          address1: data.roadAddress || data.jibunAddress,
        }));
      },
    }).open();
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update profile
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: profile.full_name, phone: profile.phone })
      .eq("id", user.id);

    if (profileError) {
      toast.error("프로필 저장에 실패했습니다");
      setSaving(false);
      return;
    }

    // Save address if filled
    if (address.postal_code && address.address1) {
      // Check if address exists
      const { data: existing } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_default", true)
        .single();

      if (existing) {
        await supabase.from("addresses").update({
          postal_code: address.postal_code,
          address_line1: address.address1,
          address_line2: address.address2 || null,
          recipient_name: profile.full_name,
          phone: profile.phone,
        }).eq("id", existing.id);
      } else {
        const { data: newAddr } = await supabase.from("addresses").insert({
          user_id: user.id,
          label: "기본 주소",
          recipient_name: profile.full_name,
          phone: profile.phone,
          postal_code: address.postal_code,
          address_line1: address.address1,
          address_line2: address.address2 || null,
          is_default: true,
        }).select().single();

        if (newAddr) {
          await supabase.from("profiles").update({ default_address_id: newAddr.id }).eq("id", user.id);
        }
      }
    }

    toast.success("저장되었습니다");
    setSaving(false);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (loading) return <div className="py-16 text-center text-sm text-gray-400">로딩 중...</div>;

  return (
    <div>
      <Script src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js" strategy="lazyOnload" />
      <h1 className="text-2xl font-light tracking-wider mb-8">회원정보</h1>

      <div className="max-w-lg space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle className="text-sm">기본 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs tracking-wider uppercase">이메일</Label>
              <Input value={profile.email} disabled className="mt-1.5 rounded-none h-11 bg-gray-50" />
            </div>
            <div>
              <Label className="text-xs tracking-wider uppercase">이름</Label>
              <Input
                value={profile.full_name}
                onChange={(e) => setProfile((p) => ({ ...p, full_name: e.target.value }))}
                className="mt-1.5 rounded-none h-11"
              />
            </div>
            <div>
              <Label className="text-xs tracking-wider uppercase">전화번호</Label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                placeholder="010-0000-0000"
                className="mt-1.5 rounded-none h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader><CardTitle className="text-sm">기본 배송지</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs tracking-wider uppercase">주소</Label>
              <div className="flex gap-2 mt-1.5">
                <Input value={address.postal_code} readOnly placeholder="우편번호" className="rounded-none h-11 w-32" />
                <Button type="button" variant="outline" onClick={openDaumPostcode} className="rounded-none h-11 text-xs">
                  주소 검색
                </Button>
              </div>
              <Input value={address.address1} readOnly placeholder="도로명 주소" className="mt-2 rounded-none h-11" />
              <Input
                value={address.address2}
                onChange={(e) => setAddress((a) => ({ ...a, address2: e.target.value }))}
                placeholder="상세 주소 (동/호수)"
                className="mt-2 rounded-none h-11"
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-black text-white hover:bg-gray-900 rounded-none h-11 px-8 text-sm tracking-wider uppercase"
          >
            {saving ? "저장 중..." : "저장"}
          </Button>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-none h-11 px-8 text-sm tracking-wider uppercase"
          >
            로그아웃
          </Button>
        </div>
      </div>
    </div>
  );
}
