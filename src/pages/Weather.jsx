import { demoData } from '../data/demoData';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CloudRain, Droplets, Wind, ThermometerSun, AlertTriangle } from 'lucide-react';

const Weather = () => {
  const data = demoData.currentStatus;
  const forecast = demoData.weatherForecast;
  const rainfallTrend = demoData.rainfallTrend;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">Weather</p>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.05em] text-slate-900">Weather for your field</h1>
        <p className="mt-2 text-slate-600">Nashik, Maharashtra • Updated just now</p>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-[1.5fr_0.8fr]">
        <div className="card overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-6xl font-light tracking-[-0.08em] text-slate-900">{data.temperature}°</div>
              <p className="mt-2 text-lg text-slate-600">{data.weatherCondition}</p>
            </div>
            <div className="rounded-[28px] bg-white/80 p-5 text-sky-600 shadow-sm">
              <CloudRain className="h-14 w-14" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-slate-500"><Droplets className="h-4 w-4 text-sky-600" /> Humidity</div>
              <div className="text-2xl font-bold text-slate-900">{data.humidity}%</div>
            </div>

            <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-slate-500"><Wind className="h-4 w-4 text-slate-600" /> Wind</div>
              <div className="text-2xl font-bold text-slate-900">{data.windSpeed} km/h</div>
            </div>

            <div className="rounded-2xl bg-white/80 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-slate-500"><ThermometerSun className="h-4 w-4 text-amber-600" /> Rain</div>
              <div className="text-2xl font-bold text-slate-900">{data.rainProbability}%</div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex items-center gap-2 text-slate-800">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="text-xl font-bold">Field impact</h2>
          </div>

          <div className="rounded-2xl bg-amber-50 p-4 text-sm leading-7 text-amber-900">
            Rain is likely over the next 48 hours. Irrigation may not be necessary today, but it is worth checking moisture in the northern edge before your next pass.
          </div>

          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Weather and field conditions are connected. Moisture is still within the normal range for wheat at this stage.
          </div>
        </div>
      </div>

      <div className="mb-8 card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Forecast</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">5-day outlook</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          {forecast.map((day) => (
            <div key={day.day} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
              <div className="text-sm font-semibold text-slate-700">{day.day}</div>
              <div className="mt-3 flex justify-center text-sky-600"><CloudRain className="h-8 w-8" /></div>
              <div className="mt-3 text-2xl font-bold text-slate-900">{day.temp}°</div>
              <div className="mt-2 text-xs font-medium text-slate-600">Rain {day.rain}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Rainfall</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Last 30 days</h2>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={rainfallTrend}>
                <defs>
                  <linearGradient id="rainfallFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="rainfall" stroke="#0284c7" fill="url(#rainfallFill)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Balance</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Rainfall vs expected</h2>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rainfallTrend}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="rainfall" fill="#0f766e" radius={[10, 10, 0, 0]} />
                <Bar dataKey="expected" fill="#cbd5e1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
