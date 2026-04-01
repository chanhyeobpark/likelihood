"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface DayData {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export function AdminSalesChart() {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const days: DayData[] = [];

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

        const { data: orders } = await supabase
          .from("orders")
          .select("total")
          .gte("created_at", dayStart.toISOString())
          .lt("created_at", dayEnd.toISOString())
          .neq("status", "CANCELLED")
          .neq("status", "REFUNDED");

        const revenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0;
        const label = `${date.getMonth() + 1}/${date.getDate()}`;

        days.push({
          date: dayStart.toISOString().split("T")[0],
          label,
          revenue,
          orders: orders?.length || 0,
        });
      }

      setData(days);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">로딩 중...</div>;
  }

  const totalWeek = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">7일 총 매출: {formatPrice(totalWeek)}</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => v >= 10000 ? `${Math.round(v / 10000)}만` : String(v)} />
          <Tooltip
            formatter={(value: any) => [formatPrice(Number(value)), "매출"]}
            labelFormatter={(label: any) => `${label}`}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="revenue" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
