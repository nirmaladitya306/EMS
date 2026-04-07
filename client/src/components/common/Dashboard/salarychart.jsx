import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--ems-surface, #fff)",
      border: "1px solid var(--ems-border, rgba(0,0,0,0.08))",
      borderRadius: 10, padding: "8px 12px", fontSize: 12,
      fontFamily: "'DM Sans', sans-serif",
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    }}>
      <p style={{ color: "var(--ems-text-faint, rgba(0,0,0,0.5))", marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontWeight: 500 }}>
          {p.name}: {p.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export const SalaryChart = ({ balancedata }) => {
  const chartData = [];

  if (balancedata?.balance?.length) {
    balancedata.balance.forEach((b) => {
      chartData.push({
        month: b.expensemonth,
        Paid: b.totalexpenses,
        Available: b.availableamount,
      });
    });
  }

  let trendPct = 0;
  if (chartData.length >= 2) {
    const last = chartData[chartData.length - 1]?.Available || 0;
    const prev = chartData[chartData.length - 2]?.Available || 1;
    trendPct = Math.round(((last - prev) / Math.abs(prev)) * 100);
  }

  const latest   = chartData[chartData.length - 1]?.Available ?? 0;
  const dateRange = chartData.length > 0
    ? `${chartData[0]?.month} – ${chartData[chartData.length - 1]?.month}`
    : "No data";

  return (
    <div className="sc-root">
      <div className="sc-header">
        <p className="sc-title">Balance</p>
        <p className="sc-sub">Salaries vs Available — {dateRange}</p>
      </div>

      <div className="sc-chart-area">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="gPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gAvail" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--ems-border, rgba(0,0,0,0.05))" />
            <XAxis dataKey="month" tickLine={false} axisLine={false}
              tick={{ fontSize: 11, fill: "var(--ems-label-color, rgba(0,0,0,0.35))" }}
              tickFormatter={(v) => v?.slice(0, 3) || ""} />
            <Tooltip content={<CustomTooltip />} />
            <Area dataKey="Paid"      name="Salaries Paid" type="monotone" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#gPaid)" />
            <Area dataKey="Available" name="Available"      type="monotone" stroke="#6366f1" strokeWidth={1.5} fill="url(#gAvail)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="sc-footer">
        <div className="sc-balance">Available: {latest.toLocaleString()}</div>
        <div className={trendPct >= 0 ? "sc-trend-up" : "sc-trend-down"}>
          {trendPct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          {Math.abs(trendPct)}% this month
        </div>
      </div>

      <style>{`
        .sc-root { display: flex; flex-direction: column; height: 100%; gap: 10px; }
        .sc-header { display: flex; flex-direction: column; gap: 2px; }
        .sc-title {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--ems-label-color, rgba(0,0,0,0.35));
          font-family: 'DM Sans', sans-serif;
        }
        .sc-sub { font-size: 12px; color: var(--ems-text-faint, rgba(0,0,0,0.4)); font-family: 'DM Sans', sans-serif; }
        .sc-chart-area { flex: 1; min-height: 180px; }
        .sc-footer {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 12px; border-top: 1px solid var(--ems-border, rgba(0,0,0,0.05));
          padding-top: 8px; font-family: 'DM Sans', sans-serif;
        }
        .sc-balance { font-weight: 500; color: var(--ems-text-primary, #0f172a); }
        .sc-trend-up   { color: #16a34a; display: flex; align-items: center; gap: 4px; font-weight: 500; }
        .sc-trend-down { color: #dc2626; display: flex; align-items: center; gap: 4px; font-weight: 500; }
      `}</style>
    </div>
  );
};
