"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type RevenueChartProps = {
  data: { day: string; revenue: number }[];
  currency?: string;
};

export function RevenueChart({ data, currency = "L.L." }: RevenueChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#71717a", fontSize: 12 }}
            width={56}
            tickFormatter={(value) =>
              value >= 1000 ? `${Math.round(Number(value) / 1000)}k` : String(value)
            }
          />
          <Tooltip
            formatter={(value) => [
              `${currency} ${Number(value).toLocaleString()}`,
              "Revenue",
            ]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e4e4e7",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          />
          <Bar dataKey="revenue" fill="#059669" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
