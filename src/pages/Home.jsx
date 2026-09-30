import { useState } from 'react';
import { Link } from 'react-router-dom';
import { demoData } from '../data/demoData';
import {
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  ChevronRight,
  CloudRain,
  Droplets,
  FileText,
  Leaf,
  MapPin,
  ShieldCheck,
  Sprout,
  SunMedium,
  Wind,
} from 'lucide-react';

const farmSnapshot = demoData;

const overviewCards = [
  { label: 'Crop', value: farmSnapshot.farm.primaryCrop, icon: Sprout, accent: 'sun' },
  { label: 'Field Area', value: farmSnapshot.farm.farmSize, icon: MapPin, accent: 'forest' },
  { label: 'Moisture', value: `${farmSnapshot.farm.soilMoisture}%`, icon: Droplets, accent: 'water' },
  { label: 'Crop Health', value: `${farmSnapshot.farm.cropHealth}%`, icon: Leaf, accent: 'leaf' },
  { label: 'Rainfall', value: `${farmSnapshot.farm.rainProbability} mm`, icon: CloudRain, accent: 'sky' },
  { label: 'Next Check', value: farmSnapshot.farm.checkIn, icon: Camera, accent: 'amber' },
  { label: 'Irrigation', value: 'On Track', icon: Droplets, accent: 'grass' },
  { label: 'Crop Stage', value: farmSnapshot.farm.cropStage, icon: BarChart3, accent: 'olive' },
];

const trackerMonths = ['August', 'September', 'October'];

const monthDetails = Object.fromEntries(
  farmSnapshot.monthlyTracker.map((item) => [
    item.month,
    {
      stage: item.stage,
      moisture: `${item.moisture}%`,
      rainfall: `${item.rainfall} mm`,
      irrigation: `${item.irrigation} times`,
      health: `${item.health}%`,
      photos: item.photos,
      note: item.note,
      trend: item.trend,
    },
  ])
);

const journeyStages = [
  { name: 'Sowing', date: '15 Jun', health: '72', moisture: '58%', note: 'Field conditions were stable after the first irrigation cycle.' },
  { name: 'Early Growth', date: '22 Jul', health: '75', moisture: '60%', note: 'Canopy filled in well, with healthy leaf coverage in the central rows.' },
  { name: 'Vegetative', date: '2 Aug', health: '76', moisture: '58%', note: 'Strong growth and consistent moisture across the block.' },
  { name: 'Flowering', date: '30 Sep', health: '82', moisture: '64%', note: 'Crop height is even and the field is balanced.' },
  { name: 'Grain Formation', date: '18 Oct', health: '84', moisture: '61%', note: 'Maturing heads are filling well with consistent field performance.' },
];

const weatherCards = [
  { label: 'Current temperature', value: `${farmSnapshot.farm.temperature}°C`, icon: SunMedium, tone: 'amber' },
  { label: 'Rainfall', value: `${farmSnapshot.farm.rainProbability} mm`, icon: CloudRain, tone: 'blue' },
  { label: 'Humidity', value: `${farmSnapshot.farm.humidity}%`, icon: Droplets, tone: 'teal' },
  { label: 'Wind', value: `${farmSnapshot.farm.windSpeed} km/h`, icon: Wind, tone: 'slate' },
];

const reportCards = [
  { title: 'Monthly Farm Report', meta: 'September' },
  { title: 'Crop Health Report', meta: 'Field A' },
  { title: 'Field History', meta: '2024–2026' },
  { title: 'Weather Summary', meta: 'Last 30 days' },
  { title: 'Irrigation History', meta: `${farmSnapshot.cropHealthReport.irrigation.events} events` },
  { title: 'Crop Rotation History', meta: `${farmSnapshot.cropHistory[0].crop} / ${farmSnapshot.cropHistory[1].crop}` },
];

const resourceCards = [
  { title: 'Crop Basics', icon: Leaf, text: 'Understanding the crop stage and expected field changes' },
  { title: 'Water & Irrigation', icon: Droplets, text: 'Simple notes on moisture planning and timing of irrigation' },
  { title: 'Soil', icon: Sprout, text: 'Keep a record of soil condition and moisture behaviour' },
  { title: 'Weather', icon: CloudRain, text: 'Use rainfall and climate context to plan practical checks' },
  { title: 'Crop Observation', icon: Camera, text: 'Track crop appearance, pest signs and field notes over time' },
  { title: 'Farming Resources', icon: FileText, text: 'Reliable seasonal references for crop records and observations' },
];

const photoJournal = farmSnapshot.fieldJournal;

const growthBars = farmSnapshot.cropHealthReport.moistureSeries;

const Home = () => {
  const [selectedMonth, setSelectedMonth] = useState('September');
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const activeMonth = monthDetails[selectedMonth] || monthDetails.September;
  const currentPhoto = photoJournal[selectedPhoto] || photoJournal[0];
  const primaryField = farmSnapshot.fields[0];

  return (
    <div className="farm-page">
      <section className="hero-section">
        <div className="hero-overlay" />
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="eyebrow primary">
              <span className="eyebrow-dot" />
              Built for real Indian farms
            </span>
            <h1>Know Your Field. Grow With Confidence.</h1>
            <p>
              Record your field, understand what is changing, track your crop month by month, and keep every important farm observation in one place.
            </p>

            <div className="hero-actions">
              <Link to="/evaluate" className="cta-button primary">
                Evaluate My Field
                <ArrowRight size={17} />
              </Link>
              <Link to="/dashboard" className="cta-button secondary">
                Open My Farm
              </Link>
            </div>

            <div className="hero-meta">
              <span><MapPin size={15} /> Built for Indian fields</span>
              <span><ShieldCheck size={15} /> Practical field records</span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="floating-photo photo-a" />
            <div className="floating-photo photo-b" />
            <div className="floating-photo photo-c" />

            <div className="mini-farm-panel">
              <div className="panel-header">
                <div>
                  <p className="label">{farmSnapshot.farm.farmer.split(' ')[0]} Farm</p>
                  <h3>{farmSnapshot.farm.farmSize}</h3>
                </div>
                <span className="status-pill">{farmSnapshot.farm.healthStatus}</span>
              </div>

              <div className="mini-grid">
                <div>
                  <span>Crop</span>
                  <strong>{farmSnapshot.farm.primaryCrop}</strong>
                </div>
                <div>
                  <span>Moisture</span>
                  <strong>{`${farmSnapshot.farm.soilMoisture}%`}</strong>
                </div>
                <div>
                  <span>Crop health</span>
                  <strong>{`${farmSnapshot.farm.cropHealth}%`}</strong>
                </div>
                <div>
                  <span>Rainfall</span>
                  <strong>{`${farmSnapshot.farm.rainProbability} mm`}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading align-left">
          <span className="eyebrow dark">Your farm at a glance</span>
          <h2>Everything about your farm, in one place.</h2>
        </div>

        <div className="stats-grid">
          {overviewCards.map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className={`stat-card accent-${accent}`}>
              <div className="card-topline">
                <span>{label}</span>
                <Icon size={18} />
              </div>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell highlight-shell">
        <div className="health-layout">
          <div className="health-ring-wrap">
            <div className="health-ring">
              <div className="health-ring-inner">
                <strong>{farmSnapshot.cropHealthReport.overallHealth}</strong>
                <span>Farm Health</span>
              </div>
            </div>
          </div>

          <div className="health-list">
            <div className="health-item">
              <span className="dot green" />
              <div><small>Crop</small><strong>{farmSnapshot.farm.healthStatus}</strong></div>
            </div>
            <div className="health-item">
              <span className="dot blue" />
              <div><small>Moisture</small><strong>{farmSnapshot.farm.soilStatus}</strong></div>
            </div>
            <div className="health-item">
              <span className="dot amber" />
              <div><small>Weather</small><strong>{farmSnapshot.farm.weatherRisk}</strong></div>
            </div>
            <div className="health-item">
              <span className="dot gold" />
              <div><small>Soil</small><strong>{farmSnapshot.farm.soilStatus}</strong></div>
            </div>
            <div className="health-item">
              <span className="dot teal" />
              <div><small>Irrigation</small><strong>{farmSnapshot.cropHealthReport.irrigation.frequency}</strong></div>
            </div>
            <div className="health-item">
              <span className="dot red" />
              <div><small>Attention</small><strong>{farmSnapshot.farm.highPriorityAlerts} priority</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell evaluation-shell">
        <div className="section-heading align-left">
          <span className="eyebrow dark">Evaluate my field</span>
          <h2>Build a complete profile of your field.</h2>
          <p>Enter the practical details about your land, crop history and current condition to create a field profile you can use throughout the season.</p>
        </div>

        <div className="evaluation-layout">
          <div className="evaluation-panel">
            <div className="step-list">
              {['Field basics', 'Crop history', 'Current crop', 'Current field condition', 'Field visualization'].map((step, index) => (
                <span key={step} className={index === 0 ? 'step-pill active' : 'step-pill'}>{step}</span>
              ))}
            </div>

            <div className="input-grid compact">
              <label>
                <span>Field name</span>
                <input defaultValue={primaryField.name} />
              </label>
              <label>
                <span>Field location</span>
                <input defaultValue={farmSnapshot.farm.location} />
              </label>
              <label>
                <span>Length</span>
                <input defaultValue="240 ft" />
              </label>
              <label>
                <span>Width</span>
                <input defaultValue="180 ft" />
              </label>
              <label>
                <span>Total area</span>
                <input defaultValue={`${primaryField.areaAcres} acres`} />
              </label>
              <label>
                <span>Soil type</span>
                <input defaultValue={primaryField.soilType} />
              </label>
              <label>
                <span>Irrigation type</span>
                <input defaultValue={primaryField.irrigationType} />
              </label>
              <label>
                <span>Water source</span>
                <input defaultValue={primaryField.waterSource} />
              </label>
            </div>

            <div className="field-summary-box">
              <div>
                <span>Estimated field area</span>
                <strong>{`${primaryField.areaAcres} acres`}</strong>
              </div>
              <button className="small-button">Save profile</button>
            </div>
          </div>

          <div className="visual-panel">
            <div className="field-visual-card">
              <div className="visual-head">
                <div>
                  <small>Field 01</small>
                  <h3>{primaryField.name}</h3>
                </div>
                <span className="status-pill subtle">{`${primaryField.areaAcres} acres`}</span>
              </div>

              <div className="field-map">
                <div className="field-row row-1" />
                <div className="field-row row-2" />
                <div className="field-row row-3" />
                <div className="field-row row-4" />
                <div className="field-zone zone-a" />
                <div className="field-zone zone-b" />
                <div className="field-zone zone-c" />
              </div>

              <div className="visual-metrics">
                <div><span>Crop</span><strong>{primaryField.crop}</strong></div>
                <div><span>Irrigation</span><strong>{primaryField.irrigationType}</strong></div>
                <div><span>Soil</span><strong>{primaryField.soilType}</strong></div>
                <div><span>Moisture</span><strong>{`${primaryField.moisture}%`}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell tracker-shell">
        <div className="section-heading align-left">
          <span className="eyebrow dark">Monthly Farm Tracker</span>
          <h2>See how your field changes throughout the season.</h2>
        </div>

        <div className="tracker-layout">
          <div className="month-selector">
            {trackerMonths.map((month) => (
              <button
                key={month}
                type="button"
                className={month === selectedMonth ? 'month-pill active' : 'month-pill'}
                onClick={() => setSelectedMonth(month)}
              >
                {month}
              </button>
            ))}
          </div>

          <div className="month-detail-panel">
            <div className="detail-head">
              <div>
                <small>{selectedMonth} 2026</small>
                <h3>{activeMonth.stage}</h3>
              </div>
              <span className="status-pill green">Crop health {activeMonth.health}</span>
            </div>

            <div className="detail-metrics">
              <div><span>Moisture</span><strong>{activeMonth.moisture}</strong></div>
              <div><span>Rainfall</span><strong>{activeMonth.rainfall}</strong></div>
              <div><span>Irrigation</span><strong>{activeMonth.irrigation}</strong></div>
              <div><span>Field photos</span><strong>{activeMonth.photos}</strong></div>
            </div>

            <div className="detail-note">
              <strong>Important field activity</strong>
              <p>{activeMonth.note}</p>
            </div>

            <div className="compare-panel">
              <h4>What changed this month?</h4>
              <div className="compare-list">
                {Object.entries(activeMonth.trend).map(([key, value]) => (
                  <div key={key} className="compare-item">
                    <span>{key}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell report-shell">
        <div className="section-heading align-left">
          <span className="eyebrow dark">Your crop health report</span>
          <h2>Track crop health with practical seasonal context.</h2>
          <p>Review field performance over time, without turning the report into a generic dashboard summary.</p>
        </div>

        <div className="report-layout">
          <div className="report-controls">
            <div className="filter-box">
              <label>
                <span>Select Field</span>
                <button className="filter-pill">{primaryField.name}</button>
              </label>
              <label>
                <span>Select Crop</span>
                <button className="filter-pill">{farmSnapshot.farm.primaryCrop}</button>
              </label>
              <label>
                <span>Select Month</span>
                <button className="filter-pill">{selectedMonth}</button>
              </label>
            </div>
          </div>

          <div className="report-card">
            <div className="report-header">
              <div className="ring-indicator">
                <div className="ring-inner">
                  <strong>{farmSnapshot.cropHealthReport.overallHealth}</strong>
                  <span>/100</span>
                </div>
              </div>

              <div className="report-summary">
                <div>
                  <span>Overall crop health</span>
                  <strong>{farmSnapshot.cropHealthReport.status}</strong>
                </div>
                <div>
                  <span>Current stage</span>
                  <strong>{farmSnapshot.cropHealthReport.currentStage}</strong>
                </div>
                <div>
                  <span>Days since sowing</span>
                  <strong>{farmSnapshot.cropHealthReport.daysSinceSowing}</strong>
                </div>
              </div>
            </div>

            <div className="report-panels">
              <div className="chart-box">
                <h4>Moisture over 30 days</h4>
                <div className="bar-chart">
                  {growthBars.map((height, index) => (
                    <span key={`${height}-${index}`} style={{ height: `${height}%` }} />
                  ))}
                </div>
              </div>

              <div className="notes-box">
                <h4>What to check next</h4>
                <ul>
                  {farmSnapshot.cropHealthReport.nextChecks.map((item) => (
                    <li key={item}><Check size={14} /> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell journey-shell">
        <div className="section-heading align-left">
          <span className="eyebrow dark">Field journey</span>
          <h2>Track the crop through each stage of the season.</h2>
        </div>

        <div className="journey-timeline">
          {journeyStages.map((stage) => (
            <div key={stage.name} className="journey-card">
              <span className="journey-line" />
              <div className="journey-badge">{stage.name}</div>
              <div className="journey-content">
                <small>{stage.date}</small>
                <h3>Crop health {stage.health}</h3>
                <p>{stage.note}</p>
                <strong>Moisture {stage.moisture}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell weather-shell">
        <div className="section-heading align-left">
          <span className="eyebrow dark">Weather around your field</span>
          <h2>Local weather context for daily decisions.</h2>
        </div>

        <div className="weather-layout">
          <div className="weather-main">
            <div className="weather-summary">
              <div>
                <span className="weather-temp">{farmSnapshot.farm.temperature}°</span>
                <p>{farmSnapshot.farm.weatherCondition}</p>
              </div>
              <div className="weather-icon"><CloudRain size={40} /></div>
            </div>

            <div className="weather-grid">
              {weatherCards.map(({ label, value, icon: Icon, tone }) => (
                <div key={label} className={`weather-tile ${tone}`}>
                  <Icon size={18} />
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="forecast-box">
            <h3>7-day forecast</h3>
            {farmSnapshot.weatherForecast.map(({ day, rain }) => (
              <div key={day} className="forecast-item">
                <span>{day}</span>
                <div className="forecast-bar">
                  <i style={{ width: `${rain}%` }} />
                </div>
                <strong>{rain}%</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell map-shell">
        <div className="farm-map-layout">
          <div className="map-panel">
            <div className="map-surface">
              <div className="field-bounds field-bounds-a" />
              <div className="field-bounds field-bounds-b" />
              <div className="field-bounds field-bounds-c" />
              <div className="map-marker marker-one">{primaryField.name}</div>
              <div className="map-marker marker-two">Pump House</div>
            </div>
          </div>

          <div className="map-info">
            <span className="eyebrow dark">Farm map</span>
            <h3>{farmSnapshot.farm.location}</h3>
            <ul>
              <li><strong>Field boundary</strong><span>{primaryField.name} · {`${primaryField.areaAcres} acres`}</span></li>
              <li><strong>Crop</strong><span>{primaryField.crop}</span></li>
              <li><strong>Field name</strong><span>{primaryField.name}</span></li>
              <li><strong>Water source</strong><span>{`${primaryField.waterSource} + ${primaryField.irrigationType.toLowerCase()}`}</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-shell photo-shell">
        <div className="section-heading align-left">
          <span className="eyebrow dark">Field photo journal</span>
          <h2>Watch your crop grow.</h2>
        </div>

        <div className="photo-layout">
          <div className="photo-card">
            <img src={currentPhoto.image} alt={currentPhoto.stage} />
            <div className="photo-stack">
              <div>
                <span>{currentPhoto.date}</span>
                <strong>{currentPhoto.stage}</strong>
              </div>
              <p>{currentPhoto.note}</p>
            </div>
          </div>

          <div className="photo-slider">
            {photoJournal.map((photo, index) => (
              <button
                key={photo.date}
                type="button"
                className={index === selectedPhoto ? 'photo-thumb active' : 'photo-thumb'}
                onClick={() => setSelectedPhoto(index)}
              >
                <span>{photo.date}</span>
                <strong>{photo.stage}</strong>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell history-shell">
        <div className="section-heading align-left">
          <span className="eyebrow dark">Farm history</span>
          <h2>Long-term records that make the farm story clearer.</h2>
        </div>

        <div className="history-grid">
          {['2024', '2025', '2026'].map((year) => (
            <div key={year} className="history-card">
              <span>{year}</span>
              <h3>{farmSnapshot.cropHistory.find((item) => item.year === year)?.crop || farmSnapshot.farm.primaryCrop}</h3>
              <ul>
                <li>Yield: {year === '2024' ? '1.9 t/acre' : year === '2025' ? '2.1 t/acre' : '2.7 t/acre'}</li>
                <li>Rainfall: {year === '2024' ? '310 mm' : year === '2025' ? '334 mm' : '342 mm'}</li>
                <li>Irrigation: {year === '2024' ? '11 events' : year === '2025' ? '14 events' : '9 events'}</li>
                <li>Notes: Seasonal field record based on local soil and rainfall patterns</li>
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell reports-shell">
        <div className="section-heading align-left">
          <span className="eyebrow dark">Reports</span>
          <h2>Keep your field information organized and easy to review.</h2>
        </div>

        <div className="reports-grid">
          {reportCards.map((report) => (
            <div key={report.title} className="report-item">
              <h3>{report.title}</h3>
              <span>{report.meta}</span>
              <div className="report-actions">
                <button className="small-button secondary">View Report</button>
                <button className="small-button">Download Report</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell resources-shell">
        <div className="section-heading align-left">
          <span className="eyebrow dark">Resources</span>
          <h2>Simple seasonal references for field decisions.</h2>
        </div>

        <div className="resources-grid">
          {resourceCards.map(({ title, icon: Icon, text }) => (
            <div key={title} className="resource-card">
              <div className="resource-icon"><Icon size={18} /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-shell">
        <div className="cta-card">
          <div>
            <span className="eyebrow dark">Know your field better.</span>
            <h2>Build a clearer picture of your land, crop and season — one field observation at a time.</h2>
          </div>
          <div className="cta-actions">
            <Link to="/evaluate" className="cta-button primary">
              Evaluate My Field
              <ChevronRight size={16} />
            </Link>
            <Link to="/dashboard" className="cta-button secondary">
              Open My Farm
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
