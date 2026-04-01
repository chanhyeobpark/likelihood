"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback`,
    });

    if (error) {
      toast.error("오류가 발생했습니다. 다시 시도해주세요.");
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center">
        <Link href="/" className="text-xl font-light tracking-[0.3em] uppercase">
          likelihood
        </Link>
        <p className="text-sm text-gray-600 mt-8 leading-relaxed">
          비밀번호 재설정 이메일을 발송했습니다.<br />
          이메일을 확인해주세요.
        </p>
        <Link href="/login" className="text-xs text-gray-400 hover:text-black mt-6 inline-block">
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <Link href="/" className="text-xl font-light tracking-[0.3em] uppercase">
          likelihood
        </Link>
        <p className="text-sm text-gray-400 mt-4">비밀번호 찾기</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-xs tracking-wider uppercase">이메일</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="가입한 이메일을 입력하세요"
            required
            className="mt-1.5 rounded-none h-11"
          />
        </div>
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white hover:bg-gray-900 rounded-none h-11 text-sm tracking-wider uppercase"
        >
          {loading ? "발송 중..." : "비밀번호 재설정 이메일 발송"}
        </Button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        <Link href="/login" className="hover:text-black">로그인으로 돌아가기</Link>
      </p>
    </div>
  );
}
