import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from 'recharts';
import * as dash from '../../api/dashboard.js';

const COLORS = ['#2c6fbb', '#59a14f', '#e15759', '#f28e2b', '#76b7b2', '#edc948', '#b07aa1'];

export default function DashboardPage() {
  const [s, setS] = useState(null);
  const [top, setTop] = useState([]);
  const [stats, setStats] = useState([]);
  const [cat, setCat] = useState([]);
  const [group, setGroup] = useState('month');

  useEffect(() => {
    dash.summary().then(setS);
    dash.mostBorrowed(5).then(setTop);
    dash.categoryBreakdown().then(setCat);
  }, []);
  useEffect(() => {
    dash.borrowStats(group).then(setStats);
  }, [group]);

  if (!s) return <p className="muted">Đang tải...</p>;
  const kpis = [
    ['Đầu sách', s.totalTitles], ['Tổng bản', s.totalCopies], ['Đang mượn', s.borrowing],
    ['Quá hạn', s.overdue], ['Độc giả', s.totalReaders],
  ];

  return (
    <div>
      <h1>Dashboard thống kê</h1>
      <div className="kpi-row">
        {kpis.map(([k, v]) => (
          <div className="kpi" key={k}><div className="kpi-val">{v}</div><div className="kpi-label">{k}</div></div>
        ))}
      </div>
      <div className="charts">
        <div className="chart-box">
          <h3>Lượt mượn theo thời gian</h3>
          <div className="chart-toolbar">
            {['day', 'month', 'year'].map((g) => (
              <button key={g} className={group === g ? 'active' : ''} onClick={() => setGroup(g)}>
                {g === 'day' ? 'Ngày' : g === 'month' ? 'Tháng' : 'Năm'}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={stats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" fontSize={12} />
              <YAxis allowDecimals={false} fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="count" name="Lượt mượn" stroke="#2c6fbb" strokeWidth={2} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Sách được mượn nhiều nhất</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={top} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" allowDecimals={false} fontSize={12} />
              <YAxis type="category" dataKey="title" width={110} fontSize={11} />
              <Tooltip />
              <Bar dataKey="count" name="Lượt" fill="#59a14f" radius={[0, 4, 4, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Cơ cấu đầu sách theo thể loại</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={cat} dataKey="count" nameKey="category" outerRadius={80} label isAnimationActive={false}>
                {cat.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
