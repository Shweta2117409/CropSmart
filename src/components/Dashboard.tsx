import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane as Plant, Droplets, Calendar, Voicemail as Soil, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const cropTypes = [
  'Rice', 'Wheat', 'Corn', 'Sugarcane', 'Cotton',
  'Soybeans', 'Potatoes', 'Tomatoes', 'Onions', 'Peanuts'
];

const soilTypes = [
  'Clay', 'Sandy', 'Loamy', 'Silt', 'Peat',
  'Chalky', 'Black', 'Red', 'Alluvial'
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<{ suitable: boolean; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    cropType: '',
    soilType: '',
    rainfall: '',
    month: ''
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      // Simple prediction logic (this should be replaced with actual ML model or API call)
      const rainfall = parseFloat(formData.rainfall);
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
                    name="cropType"
                    value={formData.cropType}
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
                    name="soilType"
                    value={formData.soilType}
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
                  Rainfall (mm/month)
                </label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="number"
                    name="rainfall"
                    value={formData.rainfall}
                    onChange={handleInputChange}
                    placeholder="Enter rainfall in mm"
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                    min="0"
                    max="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                    required
                  >
                    <option value="">Select month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
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
}