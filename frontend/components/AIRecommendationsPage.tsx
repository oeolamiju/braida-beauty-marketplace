// =============================================================================
// BRAIDA AI - RECOMMENDATIONS PAGE
// Full page for AI-powered style recommendations
// =============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AIStyleFinder from './AIStyleFinder';
import { useUserFeatures, ServiceCategory } from './useAIRecommendations';

export default function AIRecommendationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { hasAnalysis, features } = useUserFeatures();
  const [activeTab, setActiveTab] = useState<'finder' | 'profile'>('finder');

  // Get category from URL if provided
  const categoryParam = searchParams.get('category') as ServiceCategory | null;

  const handleStyleSelect = (styleId: string) => {
    // Navigate to style detail page or booking flow
    navigate(`/styles/${styleId}`);
  };

  const handleFreelancerSelect = (freelancerId: string) => {
    // Navigate to freelancer profile
    navigate(`/freelancer/${freelancerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">AI Style Recommendations</h1>
          <p className="text-purple-100">
            Discover styles perfectly matched to your unique features
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('finder')}
              className={`px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'finder'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ✨ Style Finder
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === 'profile'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              👤 My Beauty Profile
              {hasAnalysis && (
                <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                  ✓
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        {activeTab === 'finder' && (
          <AIStyleFinder
            category={categoryParam || undefined}
            onStyleSelect={handleStyleSelect}
            onFreelancerSelect={handleFreelancerSelect}
          />
        )}

        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">My Beauty Profile</h2>
              {hasAnalysis ? (
                <div className="space-y-4">
                  {features?.faceShape && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600">Face Shape</p>
                      <p className="font-semibold capitalize">{features.faceShape.shape}</p>
                    </div>
                  )}
                  {features?.skinTone && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600">Skin Tone</p>
                      <p className="font-semibold">Monk Scale {features.skinTone.monkScale}</p>
                      <p className="text-sm capitalize">{features.skinTone.undertone} undertone</p>
                    </div>
                  )}
                  {features?.hairAnalysis && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600">Hair Type</p>
                      <p className="font-semibold">{features.hairAnalysis.hairType}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-600">No analysis yet. Use the Style Finder to analyze your features.</p>
              )}
            </div>

            {/* Profile benefits */}
            {hasAnalysis && (
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                <h3 className="font-semibold text-lg mb-4">
                  Your Beauty Profile Benefits ✨
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <p className="text-sm text-gray-600">
                      Personalized style recommendations
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">💇🏾‍♀️</div>
                    <p className="text-sm text-gray-600">
                      Matched with experts for your hair type
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl mb-2">💄</div>
                    <p className="text-sm text-gray-600">
                      Color recommendations for your skin tone
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white border-t md:hidden">
        <button
          onClick={() => setActiveTab('finder')}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold"
        >
          Find My Perfect Style ✨
        </button>
      </div>
    </div>
  );
}
