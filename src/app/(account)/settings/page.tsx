"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ full_name: "", phone: "", email: "" });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) setProfile({ full_name: data.full_name || "", phone: data.phone || "", email: data.email });
      setLoading(false);
    };
    load();
  }, [router]);

  const handleSave = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profile.full_name, phone: profile.phone })
      .eq("id", user.id);

    if (error) toast.error("저장에 실패했습니다");
    else toast.success("저장되었습니다");
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) return <div className="py-16 text-center text-sm text-gray-400">로딩 중...</div>;

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">회원정보</h1>

      <div className="max-w-md space-y-4">
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

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            className="bg-black text-white hover:bg-gray-900 rounded-none h-11 px-8 text-sm tracking-wider uppercase"
          >
            저장
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
