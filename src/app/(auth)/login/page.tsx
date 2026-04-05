"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-gray-400 py-8">로딩 중...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect") || "/";
  const redirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//") ? rawRedirect : "/";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error("로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.");
        setLoading(false);
        return;
      }

      toast.success("로그인 성공!");
      window.location.href = redirect;
    } catch (err) {
      toast.error("오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "kakao" | "google" | "naver") => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${window.location.origin}/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    });
  };

  return (
    <div>
      <div className="text-center mb-8">
        <Link href="/" className="text-xl font-light tracking-[0.3em] uppercase">
          likelihood
        </Link>
        <p className="text-sm text-gray-400 mt-4">로그인</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <Label htmlFor="email" className="text-xs tracking-wider uppercase">
            이메일
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            className="mt-1.5 rounded-none h-11"
          />
        </div>
        <div>
          <Label htmlFor="password" className="text-xs tracking-wider uppercase">
            비밀번호
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            className="mt-1.5 rounded-none h-11"
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white hover:bg-gray-900 rounded-none h-11 text-sm tracking-wider uppercase"
        >
          {loading ? "로그인 중..." : "로그인"}
        </Button>
      </form>

      <div className="flex items-center justify-between mt-4 text-xs">
        <Link href="/forgot-password" className="text-gray-400 hover:text-black transition-colors">
          비밀번호 찾기
        </Link>
        <Link href="/register" className="text-gray-400 hover:text-black transition-colors">
          회원가입
        </Link>
      </div>

      <div className="relative my-8">
        <Separator />
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-xs text-gray-400">
          또는
        </span>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("kakao")}
          className="w-full rounded-none h-11 text-sm bg-[#FEE500] border-[#FEE500] text-[#191919] hover:bg-[#FDD800] hover:border-[#FDD800]"
        >
          카카오로 로그인
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("naver")}
          className="w-full rounded-none h-11 text-sm bg-[#03C75A] border-[#03C75A] text-white hover:bg-[#02b351] hover:border-[#02b351]"
        >
          네이버로 로그인
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSocialLogin("google")}
          className="w-full rounded-none h-11 text-sm"
        >
          Google로 로그인
        </Button>
      </div>
    </div>
  );
}
