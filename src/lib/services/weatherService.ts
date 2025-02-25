interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
    };
    wind_kph: number;
    humidity: number;
    feelslike_c: number;
    uv: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
    }>;
  };
}

export const getWeather = async (location: string): Promise<WeatherData> => {
  const response = await fetch(
    `${import.meta.env.VITE_WEATHER_API_URL}/forecast.json?key=${
      import.meta.env.VITE_WEATHER_API_KEY
    }&q=${location}&days=3&aqi=no`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  return response.json();
};
