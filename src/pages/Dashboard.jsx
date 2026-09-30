import { useState, useEffect } from 'react';
import { demoData } from '../data/demoData';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AlertTriangle, ArrowRight, CloudRain, Droplets, Leaf, Sprout, Wind } from 'lucide-react';

const Dashboard = () => {
  const [data] = useState(demoData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  const pieData = data.fieldAreaData;

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-56 rounded-full bg-slate-200" />
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-32 rounded-[28px] bg-slate-200" />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-80 rounded-[28px] bg-slate-200 lg:col-span-2" />
            <div className="h-80 rounded-[28px] bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">Good morning</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-slate-900">{data.farmer.name}</h1>
          <p className="mt-2 text-slate-600">Farm overview for {data.farmer.location}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="btn-secondary">Nashik</button>
          <button className="btn-secondary">Patil Farm</button>
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">Next check-in: {data.farmer.checkIn}</span>
        </div>
      </div>

      <div className="mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total area', value: data.farmer.farmSize, icon: Leaf, tone: 'emerald' },
          { label: 'Crop condition', value: `${data.currentStatus.cropHealth}%`, icon: Sprout, tone: 'green' },
          { label: 'Soil moisture', value: `${data.currentStatus.soilMoisture}%`, icon: Droplets, tone: 'blue' },
          { label: 'Attention', value: `${data.currentStatus.aiAlerts} items`, icon: AlertTriangle, tone: 'amber' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{label}</span>
              <div className={`rounded-xl p-2 ${tone === 'emerald' ? 'bg-emerald-100 text-emerald-700' : tone === 'green' ? 'bg-green-100 text-green-700' : tone === 'blue' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-[-0.05em] text-slate-900">{value}</div>
            <div className="mt-2 text-sm text-slate-500">Updated today</div>
          </div>
        ))}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Field trend</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Crop condition</h2>
            </div>
            <button className="btn-secondary text-xs">Last 30 days</button>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.healthTrendData}>
                <defs>
                  <linearGradient id="cropTrend" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#166534" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#166534" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[60, 95]} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#166534" fill="url(#cropTrend)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Today</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Weather</h2>
            </div>
            <CloudRain className="h-6 w-6 text-blue-600" />
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="text-5xl font-light tracking-[-0.08em] text-slate-900">{data.currentStatus.temperature}°</div>
              <p className="text-sm text-slate-600">{data.currentStatus.weatherCondition}</p>
            </div>
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
              <CloudRain className="h-8 w-8" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500"><Droplets className="h-4 w-4 text-blue-600" /> Humidity</div>
              <div className="mt-3 text-xl font-bold text-slate-900">{data.currentStatus.humidity}%</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500"><Wind className="h-4 w-4 text-slate-600" /> Wind</div>
              <div className="mt-3 text-xl font-bold text-slate-900">{data.currentStatus.windSpeed} km/h</div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">
            Rain probability is elevated over the next 48 hours. Irrigation can wait unless soil moisture drops below the preferred range.
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Land use</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Farm area</h2>
            </div>
            <button className="btn-secondary text-xs">Cultivated</button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={88} paddingAngle={4}>
                  {pieData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            {pieData.map((entry) => (
              <div key={entry.name} className="rounded-2xl bg-slate-50 p-3 text-center">
                <div className="mx-auto mb-2 h-3 w-3 rounded-full" style={{ backgroundColor: entry.fill }} />
                <div className="font-semibold text-slate-900">{entry.value} ac</div>
                <div className="text-slate-500">{entry.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Priority</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">What needs attention</h2>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {data.recommendations.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${item.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : item.priority === 'MEDIUM' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                    {item.priority}
                  </span>
                  <span className="text-xs text-slate-500">{item.category}</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Rainfall</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Last 30 days</h2>
          </div>
          <button className="btn-secondary text-xs">Historical vs forecast</button>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.rainfallTrend}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="rainfall" fill="#0f766e" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expected" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 card p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Kaggle mandi data</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              {data.kaggleMarketData.featuredCommodity} modal price in {data.kaggleMarketData.state}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Average modal price: Rs {data.kaggleMarketData.averageModalPrice.toLocaleString('en-IN')} per quintal
            </p>
          </div>
          <span className="text-xs text-slate-500">{data.kaggleMarketData.rowCount.toLocaleString('en-IN')} records bundled</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.kaggleMarketData.priceTrend}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} hide />
              <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
              <Tooltip formatter={(value) => [`Rs ${Number(value).toLocaleString('en-IN')}`, 'Modal price']} />
              <Line type="monotone" dataKey="price" stroke="#b45309" strokeWidth={3} dot={{ r: 4, fill: '#b45309' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
