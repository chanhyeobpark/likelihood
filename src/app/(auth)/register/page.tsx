"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    fullName: "",
    phone: "",
    marketingConsent: false,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      toast.error("비밀번호가 일치하지 않습니다");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("비밀번호는 6자 이상이어야 합니다");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone,
          marketing_consent: formData.marketingConsent,
        },
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success("회원가입이 완료되었습니다. 이메일을 확인해주세요.");
    router.push("/login");
  };

  return (
    <div>
      <div className="text-center mb-8">
        <Link href="/" className="text-xl font-light tracking-[0.3em] uppercase">
          likelihood
        </Link>
        <p className="text-sm text-gray-400 mt-4">회원가입</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="text-xs tracking-wider uppercase">이름</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData((f) => ({ ...f, fullName: e.target.value }))}
            placeholder="홍길동"
            required
            className="mt-1.5 rounded-none h-11"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-xs tracking-wider uppercase">이메일</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((f) => ({ ...f, email: e.target.value }))}
            placeholder="email@example.com"
            required
            className="mt-1.5 rounded-none h-11"
          />
        </div>
        <div>
          <Label htmlFor="phone" className="text-xs tracking-wider uppercase">전화번호</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData((f) => ({ ...f, phone: e.target.value }))}
            placeholder="010-0000-0000"
            className="mt-1.5 rounded-none h-11"
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-xs tracking-wider uppercase">비밀번호</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData((f) => ({ ...f, password: e.target.value }))}
            placeholder="6자 이상"
            required
            className="mt-1.5 rounded-none h-11"
          />
        </div>
        <div>
          <Label htmlFor="passwordConfirm" className="text-xs tracking-wider uppercase">비밀번호 확인</Label>
          <Input
            id="passwordConfirm"
            type="password"
            value={formData.passwordConfirm}
            onChange={(e) => setFormData((f) => ({ ...f, passwordConfirm: e.target.value }))}
            placeholder="비밀번호 재입력"
            required
            className="mt-1.5 rounded-none h-11"
          />
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Checkbox
            id="marketing"
            checked={formData.marketingConsent}
            onCheckedChange={(checked) =>
              setFormData((f) => ({ ...f, marketingConsent: checked === true }))
            }
          />
          <label htmlFor="marketing" className="text-xs text-gray-500">
            마케팅 수신에 동의합니다 (선택)
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white hover:bg-gray-900 rounded-none h-11 text-sm tracking-wider uppercase mt-2"
        >
          {loading ? "처리 중..." : "회원가입"}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-black hover:underline">
          로그인
        </Link>
      </p>
    </div>
  );
}
