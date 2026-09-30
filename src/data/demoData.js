import agricultureData from './india-agriculture-data.json';
import kaggleCsv from './kaggle/india-agriculture-market.csv?raw';

const parseCsvRow = (row) => {
  const values = [];
  let value = '';
  let quoted = false;

  for (const character of row) {
    if (character === '"') {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += character;
    }
  }

  values.push(value.trim());
  return values;
};

const csvLines = kaggleCsv.trim().split(/\r?\n/);
const csvHeaders = parseCsvRow(csvLines[0]);
const marketRows = csvLines.slice(1).map((line) => {
  const values = parseCsvRow(line);
  return Object.fromEntries(csvHeaders.map((header, index) => [header, values[index]]));
});

const maharashtraMarketRows = marketRows
  .filter((row) => row.state === agricultureData.farm.state)
  .map((row) => ({
    commodity: row.commodity,
    market: row.market,
    modalPrice: Number(row.modal_price),
    minPrice: Number(row.min_price),
    maxPrice: Number(row.max_price),
    arrivalDate: row.arrival_date,
  }));

const primaryCropMarketRows = maharashtraMarketRows.filter((row) =>
  row.commodity.toLowerCase().includes(agricultureData.farm.primaryCrop.toLowerCase())
);
const fallbackMarketRows = maharashtraMarketRows.filter((row) => row.commodity === 'Onion');
const featuredMarketRows = primaryCropMarketRows.length > 0 ? primaryCropMarketRows : fallbackMarketRows;
const averageModalPrice = featuredMarketRows.length > 0
  ? Math.round(featuredMarketRows.reduce((total, row) => total + row.modalPrice, 0) / featuredMarketRows.length)
  : 0;

const kaggleMarketData = {
  source: 'Kaggle: thammuio/all-agriculture-related-datasets-for-india',
  version: 4,
  rowCount: marketRows.length,
  state: agricultureData.farm.state,
  featuredCommodity: featuredMarketRows[0]?.commodity || 'Onion',
  averageModalPrice,
  priceTrend: featuredMarketRows.map((row, index) => ({
    label: `${row.market} ${index + 1}`,
    price: row.modalPrice,
    minPrice: row.minPrice,
    maxPrice: row.maxPrice,
    commodity: row.commodity,
  })),
};

const dataDrivenRecommendations = [
  ...agricultureData.recommendations,
  {
    id: 4,
    priority: 'MEDIUM',
    category: 'Market price',
    title: `Review ${kaggleMarketData.featuredCommodity} mandi prices before selling`,
    description: `Kaggle mandi records for ${agricultureData.farm.state} show an average modal price of Rs ${kaggleMarketData.averageModalPrice.toLocaleString('en-IN')} per quintal. Compare the current local quote before dispatching produce.`,
  },
];

export const demoData = {
  ...agricultureData,
  kaggleMarketData,
  recommendations: dataDrivenRecommendations,
  farmer: {
    name: agricultureData.farm.farmer,
    location: agricultureData.farm.location,
    farmSize: agricultureData.farm.farmSize,
    primaryCrop: agricultureData.farm.primaryCrop,
    fields: agricultureData.farm.fields,
    checkIn: agricultureData.farm.checkIn,
    state: agricultureData.farm.state,
  },
  currentStatus: {
    cropHealth: agricultureData.farm.cropHealth,
    healthStatus: agricultureData.farm.healthStatus,
    healthTrend: agricultureData.farm.healthTrend,
    soilMoisture: agricultureData.farm.soilMoisture,
    soilStatus: agricultureData.farm.soilStatus,
    temperature: agricultureData.farm.temperature,
    humidity: agricultureData.farm.humidity,
    rainProbability: agricultureData.farm.rainProbability,
    weatherCondition: agricultureData.farm.weatherCondition,
    windSpeed: agricultureData.farm.windSpeed,
    weatherRisk: agricultureData.farm.weatherRisk,
    aiAlerts: dataDrivenRecommendations.length,
    highPriorityAlerts: agricultureData.farm.highPriorityAlerts,
  },
};
