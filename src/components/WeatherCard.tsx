import { motion } from 'framer-motion';
import { Sun, Cloud, Droplets, Wind, ThermometerSun } from 'lucide-react';

interface WeatherCardProps {
  weatherData: any;
  summary: string;
}

export const WeatherCard = ({ weatherData, summary }: WeatherCardProps) => {
  const { location, current, forecast } = weatherData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-700/50 overflow-hidden max-w-lg" // Changed from max-w-md
    >
      {/* Main Weather Info */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-white"> {/* Increased from text-lg */}
              {location.name}, {location.country}
            </h3>
            <p className="text-sm text-gray-400">{location.localtime}</p> {/* Increased from text-xs */}
          </div>
          <div className="text-right flex items-center gap-2">
            <div className="text-3xl font-bold text-white"> {/* Increased from text-2xl */}
              {current.temp_c}°C
            </div>
            <div className="text-base text-gray-400"> {/* Increased from text-sm */}
              {current.temp_f}°F
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <img
            src={`https:${current.condition.icon}`}
            alt={current.condition.text}
            className="w-12 h-12"
          />
          <div>
            <p className="text-sm text-white/90">{current.condition.text}</p>
            <div className="flex gap-3 mt-1 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3" />
                {current.wind_kph} km/h
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                {current.humidity}%
              </span>
              <span className="flex items-center gap-1">
                <Sun className="w-3 h-3" />
                UV: {current.uv}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast */}
      <div className="border-t border-gray-700/50">
        <div className="p-3">
          <h4 className="text-xs font-medium text-gray-400 mb-2">3-Day Forecast</h4>
          <div className="grid grid-cols-3 gap-2">
            {forecast.forecastday.map((day: any) => (
              <div 
                key={day.date}
                className="text-center p-2 rounded-lg bg-gray-800/30"
              >
                <p className="text-[10px] text-gray-400">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <img
                  src={`https:${day.day.condition.icon}`}
                  alt={day.day.condition.text}
                  className="w-6 h-6 mx-auto my-1"
                />
                <div className="text-[10px] text-white">
                  <span>{day.day.maxtemp_c}°C</span>
                  <span className="text-gray-400"> / </span>
                  <span>{day.day.maxtemp_f}°F</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="border-t border-gray-700/50 bg-gray-900/30 p-3">
        <p className="text-xs text-gray-300">
          {summary}
        </p>
      </div>
    </motion.div>
  );
};
