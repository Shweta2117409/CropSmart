import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane as Plant, Droplets, Calendar, Voicemail as Soil, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Define types for better TypeScript support
type SoilType = "Clay" | "Clay Loam" | "Silt Loam" | "Loam" | "Sandy Loam" | "Sandy";
type RainfallCategory = "light" | "moderate" | "heavy";
type SuitabilityLevel = "high" | "medium" | "low";

interface MonthSuitability {
  high: number[];
  medium: number[];
  low: number[];
}

interface SoilPreference {
  high: string[];
  medium: string[];
  low: string[];
}

interface CropCondition {
  suitableMonths: MonthSuitability;
  soilPreference: SoilPreference;
  minRainfall: number;
  maxRainfall: number;
}

interface RainfallCategoryInfo {
  label: string;
  value: number;
}

const cropTypes = [
  'Rice', 'Wheat', 'Corn', 'Sugarcane', 'Cotton',
  'Soybeans', 'Potatoes', 'Tomatoes', 'Onions', 'Peanuts'
];

const soilTypes: SoilType[] = ["Clay", "Clay Loam", "Silt Loam", "Loam", "Sandy Loam", "Sandy"];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Define crop conditions including soil types
const cropConditions: Record<string, CropCondition> = {
  Rice: {
    suitableMonths: {
      high: [6, 7, 8],     // Main Kharif season (monsoon)
      medium: [5, 9],      // Pre and post monsoon
      low: [1, 2, 3, 4, 10, 11, 12]
    },
    soilPreference: {
      high: ["Clay", "Clay Loam"],  // Best water retention
      medium: ["Silt Loam", "Loam"],
      low: ["Sandy", "Sandy Loam"]  // Poor water retention
    },
    minRainfall: 100,
    maxRainfall: 200
  },
  Wheat: {
    suitableMonths: {
      high: [10, 11],      // Rabi season sowing
      medium: [9, 12],     // Early or late sowing
      low: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    soilPreference: {
      high: ["Loam", "Clay Loam"],
      medium: ["Silt Loam", "Sandy Loam"],
      low: ["Clay", "Sandy"]
    },
    minRainfall: 40,
    maxRainfall: 110
  },
  Corn: {
    suitableMonths: {
      high: [6, 7],        // Kharif season
      medium: [2, 3, 8],   // Rabi and late Kharif
      low: [1, 4, 5, 9, 10, 11, 12]
    },
    soilPreference: {
      high: ["Loam", "Silt Loam"],
      medium: ["Clay Loam", "Sandy Loam"],
      low: ["Clay", "Sandy"]
    },
    minRainfall: 50,
    maxRainfall: 100
  },
  Sugarcane: {
    suitableMonths: {
      high: [2, 3],        // Spring planting
      medium: [9, 10],     // Autumn planting
      low: [1, 4, 5, 6, 7, 8, 11, 12]
    },
    soilPreference: {
      high: ["Loam", "Sandy Loam"],
      medium: ["Clay Loam", "Silt Loam"],
      low: ["Clay", "Sandy"]
    },
    minRainfall: 75,
    maxRainfall: 150
  },
  Cotton: {
    suitableMonths: {
      high: [4, 5],        // Early summer sowing
      medium: [3, 6],      // Late spring or early monsoon
      low: [1, 2, 7, 8, 9, 10, 11, 12]
    },
    soilPreference: {
      high: ["Black Cotton Soil", "Clay Loam"],
      medium: ["Loam", "Sandy Loam"],
      low: ["Sandy", "Silt"]
    },
    minRainfall: 50,
    maxRainfall: 100
  },
  Soybeans: {
    suitableMonths: {
      high: [6, 7],        // Kharif season
      medium: [5, 8],      // Pre and post optimal
      low: [1, 2, 3, 4, 9, 10, 11, 12]
    },
    soilPreference: {
      high: ["Loam", "Clay Loam"],
      medium: ["Silt Loam", "Sandy Loam"],
      low: ["Sandy", "Heavy Clay"]
    },
    minRainfall: 45,
    maxRainfall: 100
  },
  Potatoes: {
    suitableMonths: {
      high: [10, 11],      // Rabi season
      medium: [9, 12],     // Early or late Rabi
      low: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    soilPreference: {
      high: ["Sandy Loam", "Loam"],
      medium: ["Silt Loam", "Clay Loam"],
      low: ["Clay", "Sandy"]
    },
    minRainfall: 35,
    maxRainfall: 75
  },
  Tomatoes: {
    suitableMonths: {
      high: [7, 8],        // Kharif season
      medium: [6, 9, 2, 3], // Spring and late monsoon
      low: [1, 4, 5, 10, 11, 12]
    },
    soilPreference: {
      high: ["Loam", "Sandy Loam"],
      medium: ["Silt Loam", "Clay Loam"],
      low: ["Clay", "Sandy"]
    },
    minRainfall: 40,
    maxRainfall: 80
  },
  Onions: {
    suitableMonths: {
      high: [10, 11],      // Rabi season
      medium: [9, 12],     // Early or late Rabi
      low: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    soilPreference: {
      high: ["Loam", "Sandy Loam"],
      medium: ["Silt Loam", "Clay Loam"],
      low: ["Clay", "Sandy"]
    },
    minRainfall: 35,
    maxRainfall: 70
  },
  Peanuts: {
    suitableMonths: {
      high: [6, 7],        // Kharif season
      medium: [5, 8],      // Pre and post monsoon
      low: [1, 2, 3, 4, 9, 10, 11, 12]
    },
    soilPreference: {
      high: ["Sandy Loam", "Loam"],
      medium: ["Red Soil", "Clay Loam"],
      low: ["Heavy Clay", "Sandy"]
    },
    minRainfall: 50,
    maxRainfall: 90
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<{ suitable: boolean; message: string } | null>(null);
  
  const [measurementType, setMeasurementType] = useState<'category' | 'exact'>('category');
  const [exactRainfall, setExactRainfall] = useState<string>('50');
  const [rainfallCategory, setRainfallCategory] = useState<RainfallCategory>('moderate');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice');
  const [selectedSoil, setSelectedSoil] = useState<SoilType>('Clay Loam');

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'measurementType') {
      setMeasurementType(value as 'category' | 'exact');
    } else if (name === 'exactRainfall') {
      setExactRainfall(value);
    } else if (name === 'rainfallCategory') {
      setRainfallCategory(value as RainfallCategory);
    } else if (name === 'selectedMonth') {
      setSelectedMonth(Number(value));
    } else if (name === 'selectedCrop') {
      setSelectedCrop(value);
    } else if (name === 'selectedSoil') {
      setSelectedSoil(value as SoilType);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      // Simple prediction logic (this should be replaced with actual ML model or API call)
      const rainfall = parseFloat(measurementType === 'category' ? rainfallCategory : exactRainfall);
      let suitable = true;
      let message = '';

      if (rainfall < 50) {
        suitable = false;
        message = 'Rainfall is too low for optimal crop growth.';
      } else if (rainfall > 300) {
        suitable = false;
        message = 'Rainfall is too high, might cause waterlogging.';
      } else {
        message = 'Conditions look favorable for crop growth!';
      }

      setPrediction({ suitable, message });
    } catch (error) {
      console.error('Prediction error:', error);
      setPrediction({
        suitable: false,
        message: 'Error making prediction. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Rainfall categories with proper typing
  const rainfallCategories: Record<RainfallCategory, RainfallCategoryInfo> = {
    light: {
      label: "Light Rainfall (0-50mm)",
      value: 25
    },
    moderate: {
      label: "Moderate Rainfall (50-100mm)",
      value: 75
    },
    heavy: {
      label: "Heavy Rainfall (100-200mm)",
      value: 150
    }
  };

  // Helper functions with proper return types
  const checkMonthSuitability = (): SuitabilityResult => {
    const conditions = cropConditions[selectedCrop];
    
    if (conditions.suitableMonths.high.includes(selectedMonth)) {
      return {
        level: "high",
        message: `${getMonthName(selectedMonth)} is ideal for planting ${selectedCrop}.`
      };
    } else if (conditions.suitableMonths.medium.includes(selectedMonth)) {
      return {
        level: "medium",
        message: `${getMonthName(selectedMonth)} is acceptable for planting ${selectedCrop}, but not ideal.`
      };
    } else {
      return {
        level: "low",
        message: `${getMonthName(selectedMonth)} is not recommended for planting ${selectedCrop}.`
      };
    }
  };

  const getMonthName = (monthNumber: number): string => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthNumber - 1];
  };

  const getSeasonalContext = (month: number): string => {
    if ([12, 1, 2].includes(month)) return "Winter";
    if ([3, 4, 5].includes(month)) return "Spring";
    if ([6, 7, 8].includes(month)) return "Monsoon";
    return "Autumn";
  };

  const getDetailedRecommendations = (monthSuitability: any, soilSuitability: any, rainfallSuitability: any) => {
    const recommendations = [];
    const season = getSeasonalContext(selectedMonth);
    
    if (monthSuitability.level === "low") {
      const nextBestMonth = cropConditions[selectedCrop].suitableMonths.high[0];
      const monthsToWait = (nextBestMonth - selectedMonth + 12) % 12;
      recommendations.push(
        `Current season (${season}) is not suitable. Wait approximately ${monthsToWait} months for optimal planting time.`
      );
    }

    if (soilSuitability.level === "low") {
      const bestSoils = cropConditions[selectedCrop].soilPreference.high.join(" or ");
      recommendations.push(
        `Consider soil amendments to make your ${selectedSoil} soil more similar to ${bestSoils} conditions.`
      );
    }

    return recommendations;
  };

  const checkRainfallSuitability = (): SuitabilityResult => {
    const conditions = cropConditions[selectedCrop];
    const currentRainfall = measurementType === 'category' 
      ? rainfallCategories[rainfallCategory].value 
      : Number(exactRainfall);

    if (currentRainfall >= conditions.minRainfall && currentRainfall <= conditions.maxRainfall) {
      return {
        level: "high",
        message: `Current rainfall is ideal for ${selectedCrop}.`
      };
    } else if (
      currentRainfall >= conditions.minRainfall * 0.7 && 
      currentRainfall <= conditions.maxRainfall * 1.3
    ) {
      return {
        level: "medium",
        message: `Rainfall conditions are acceptable but not ideal for ${selectedCrop}.`
      };
    } else {
      return {
        level: "low",
        message: `Current rainfall is not suitable for ${selectedCrop}.`
      };
    }
  };

  const checkSoilSuitability = (): SuitabilityResult => {
    const conditions = cropConditions[selectedCrop];
    
    if (conditions.soilPreference.high.includes(selectedSoil)) {
      return {
        level: "high",
        message: `${selectedSoil} soil is ideal for ${selectedCrop}.`
      };
    } else if (conditions.soilPreference.medium.includes(selectedSoil)) {
      return {
        level: "medium",
        message: `${selectedSoil} soil is acceptable for ${selectedCrop}.`
      };
    } else {
      return {
        level: "low",
        message: `${selectedSoil} soil is not recommended for ${selectedCrop}.`
      };
    }
  };

  // Result type definition
  interface SuitabilityResult {
    level: 'high' | 'medium' | 'low';
    message: string;
  }

  const checkOverallSuitability = (): SuitabilityResult => {
    const monthSuit = checkMonthSuitability();
    const rainfallSuit = checkRainfallSuitability();
    const soilSuit = checkSoilSuitability();
    
    const scores = { high: 3, medium: 2, low: 1 };
    const totalScore = scores[monthSuit.level] + scores[rainfallSuit.level] + scores[soilSuit.level];
    
    let status: 'high' | 'medium' | 'low';
    let message: string;
    
    if (totalScore >= 8) {
      status = "high";
      message = `Highly Suitable for ${selectedCrop}`;
    } else if (totalScore >= 5) {
      status = "medium";
      message = `Moderately Suitable for ${selectedCrop}`;
    } else {
      status = "low";
      message = `Low Suitability for ${selectedCrop}`;
    }

    return {
      level: status,
      message
    };
  };

  const getSuitabilityColor = (level: 'high' | 'medium' | 'low'): string => {
    const colors = {
      high: "text-green-700 bg-green-50",
      medium: "text-yellow-700 bg-yellow-50",
      low: "text-red-700 bg-red-50"
    };
    return colors[level];
  };

  const result = checkOverallSuitability();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Plant className="h-6 w-6 text-green-600 mr-2" />
              <h1 className="text-xl font-semibold text-gray-800">CropSmart Dashboard</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Crop Suitability Prediction</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crop Type
                </label>
                <div className="relative">
                  <Plant className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    name="selectedCrop"
                    value={selectedCrop}
                    onChange={handleInputChange}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    required
                  >
                    <option value="">Select crop type</option>
                    {cropTypes.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Soil Type
                </label>
                <div className="relative">
                  <Soil className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    name="selectedSoil"
                    value={selectedSoil}
                    onChange={handleInputChange}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    required
                  >
                    <option value="">Select soil type</option>
                    {soilTypes.map(soil => (
                      <option key={soil} value={soil}>{soil}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Measurement Type
                </label>
                <div className="relative">
                  <select
                    name="measurementType"
                    value={measurementType}
                    onChange={handleInputChange}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    required
                  >
                    <option value="category">Category</option>
                    <option value="exact">Exact</option>
                  </select>
                </div>
              </div>

              {measurementType === 'exact' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rainfall (mm)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="exactRainfall"
                      value={exactRainfall}
                      onChange={handleInputChange}
                      placeholder="Enter rainfall in mm"
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                      min="0"
                      max="1000"
                    />
                  </div>
                </div>
              )}

              {measurementType === 'category' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rainfall Category
                  </label>
                  <div className="relative">
                    <select
                      name="rainfallCategory"
                      value={rainfallCategory}
                      onChange={handleInputChange}
                      className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                      required
                    >
                      <option value="light">Light Rainfall (0-50mm)</option>
                      <option value="moderate">Moderate Rainfall (50-100mm)</option>
                      <option value="heavy">Heavy Rainfall (100-200mm)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    name="selectedMonth"
                    value={selectedMonth}
                    onChange={handleInputChange}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    required
                  >
                    <option value="">Select month</option>
                    {months.map((_, index) => (
                      <option key={index + 1} value={index + 1}>{months[index]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? 'Analyzing...' : 'Predict Crop Suitability'}
              </button>
            </div>
          </form>

          {prediction && (
            <div className={`mt-6 p-4 rounded-lg flex items-start space-x-3 ${
              prediction.suitable ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {prediction.suitable ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div>
                <h3 className={`font-medium ${
                  prediction.suitable ? 'text-green-800' : 'text-red-800'
                }`}>
                  {prediction.suitable ? 'Suitable for Farming' : 'Not Recommended'}
                </h3>
                <p className={`mt-1 text-sm ${
                  prediction.suitable ? 'text-green-700' : 'text-red-700'
                }`}>
                  {prediction.message}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;