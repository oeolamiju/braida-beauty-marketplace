// =============================================================================
// BRAIDA AI - STYLE FINDER COMPONENT
// Interactive component for finding personalized style recommendations
// =============================================================================

import React, { useState, useRef, useCallback } from 'react';
import { 
  useImageAnalysis, 
  useRecommendations,
  useInteractionTracking,
  FaceShape,
  HairType,
  MonkScale,
  SkinUndertone,
  ServiceCategory,
  MONK_SCALE_NAMES,
  HAIR_TYPE_DESCRIPTIONS,
  FACE_SHAPE_DESCRIPTIONS,
  UNDERTONE_DESCRIPTIONS,
} from '../../hooks/useAIRecommendations';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface AIStyleFinderProps {
  category?: ServiceCategory;
  onStyleSelect?: (styleId: string) => void;
  onFreelancerSelect?: (freelancerId: string) => void;
}

export default function AIStyleFinder({ 
  category: initialCategory,
  onStyleSelect,
  onFreelancerSelect,
}: AIStyleFinderProps) {
  const [step, setStep] = useState<'select' | 'upload' | 'manual' | 'results'>('select');
  const [category, setCategory] = useState<ServiceCategory>(initialCategory || 'hair');
  const [manualFeatures, setManualFeatures] = useState<{
    faceShape?: FaceShape;
    skinTone?: MonkScale;
    undertone?: SkinUndertone;
    hairType?: HairType;
  }>({});
  const [occasion, setOccasion] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { analyzing, result: analysisResult, analyzeImage, reset: resetAnalysis } = useImageAnalysis();
  const { loading: loadingRecs, styles, freelancers, getRecommendations, getPreviewRecommendations } = useRecommendations();
  const { trackClick, trackSave } = useInteractionTracking();

  // Handle image upload
  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await analyzeImage(file);
    }
  }, [analyzeImage]);

  // Get recommendations based on analysis or manual input
  const handleGetRecommendations = useCallback(async () => {
    if (analysisResult) {
      // Use analyzed features
      await getPreviewRecommendations({
        category,
        faceShape: analysisResult.faceShape?.shape,
        skinTone: analysisResult.skinTone?.monkScale,
        undertone: analysisResult.skinTone?.undertone,
        hairType: analysisResult.hairAnalysis?.hairType,
        occasion,
      });
    } else if (Object.keys(manualFeatures).length > 0) {
      // Use manual features
      await getPreviewRecommendations({
        category,
        faceShape: manualFeatures.faceShape,
        skinTone: manualFeatures.skinTone,
        undertone: manualFeatures.undertone,
        hairType: manualFeatures.hairType,
        occasion,
      });
    }
    setStep('results');
  }, [analysisResult, manualFeatures, category, occasion, getPreviewRecommendations]);

  // Render based on step
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ✨ AI Style Finder
        </h1>
        <p className="text-gray-600">
          Get personalized style recommendations based on your unique features
        </p>
      </div>

      {/* Step: Select Method */}
      {step === 'select' && (
        <div className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are you looking for?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['hair', 'makeup', 'gele', 'tailoring'] as ServiceCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    category === cat
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="text-2xl mb-1 block">
                    {cat === 'hair' && '💇🏾‍♀️'}
                    {cat === 'makeup' && '💄'}
                    {cat === 'gele' && '👑'}
                    {cat === 'tailoring' && '👗'}
                  </span>
                  <span className="text-sm font-medium capitalize">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Method Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setStep('upload')}
              className="p-6 rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all text-left"
            >
              <div className="text-3xl mb-2">📷</div>
              <h3 className="font-semibold text-lg mb-1">Upload a Photo</h3>
              <p className="text-sm text-gray-500">
                Our AI will analyze your face shape, skin tone, and hair type automatically
              </p>
            </button>

            <button
              onClick={() => setStep('manual')}
              className="p-6 rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all text-left"
            >
              <div className="text-3xl mb-2">✍️</div>
              <h3 className="font-semibold text-lg mb-1">Enter Manually</h3>
              <p className="text-sm text-gray-500">
                Select your features yourself for personalized recommendations
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Step: Upload Photo */}
      {step === 'upload' && (
        <div className="space-y-6">
          <button
            onClick={() => { setStep('select'); resetAnalysis(); }}
            className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            ← Back
          </button>

          {!analysisResult ? (
            <div className="text-center">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-12 cursor-pointer hover:border-purple-400 transition-all"
              >
                {analyzing ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-gray-600">Analyzing your photo...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-5xl mb-4">📸</div>
                    <p className="text-lg font-medium mb-2">Click to upload a photo</p>
                    <p className="text-sm text-gray-500">
                      For best results, use a clear front-facing photo with good lighting
                    </p>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Analysis Results</h2>
              
              {/* Results Cards */}
              <div className="grid md:grid-cols-3 gap-4">
                {analysisResult.faceShape && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200">
                    <div className="text-2xl mb-2">😊</div>
                    <p className="text-sm text-gray-500">Face Shape</p>
                    <p className="font-semibold capitalize">{analysisResult.faceShape.shape}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {Math.round(analysisResult.faceShape.confidence * 100)}% confidence
                    </p>
                  </div>
                )}

                {analysisResult.skinTone && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                    <div className="text-2xl mb-2">🎨</div>
                    <p className="text-sm text-gray-500">Skin Tone</p>
                    <p className="font-semibold">
                      {MONK_SCALE_NAMES[analysisResult.skinTone.monkScale]}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {analysisResult.skinTone.undertone} undertone
                    </p>
                  </div>
                )}

                {analysisResult.hairAnalysis && (
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
                    <div className="text-2xl mb-2">💇🏾‍♀️</div>
                    <p className="text-sm text-gray-500">Hair Type</p>
                    <p className="font-semibold">{analysisResult.hairAnalysis.hairType}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {HAIR_TYPE_DESCRIPTIONS[analysisResult.hairAnalysis.hairType]}
                    </p>
                  </div>
                )}
              </div>

              {/* Occasion Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's the occasion? (optional)
                </label>
                <select
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                >
                  <option value="">Any occasion</option>
                  <option value="everyday">Everyday</option>
                  <option value="work">Work</option>
                  <option value="wedding">Wedding</option>
                  <option value="party">Party</option>
                  <option value="vacation">Vacation</option>
                  <option value="photoshoot">Photoshoot</option>
                </select>
              </div>

              <button
                onClick={handleGetRecommendations}
                disabled={loadingRecs}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loadingRecs ? 'Finding styles...' : 'Get My Recommendations ✨'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step: Manual Entry */}
      {step === 'manual' && (
        <div className="space-y-6">
          <button
            onClick={() => setStep('select')}
            className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            ← Back
          </button>

          <h2 className="text-xl font-semibold">Tell us about yourself</h2>

          {/* Face Shape */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Face Shape
            </label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {(['oval', 'round', 'square', 'heart', 'oblong', 'diamond'] as FaceShape[]).map((shape) => (
                <button
                  key={shape}
                  onClick={() => setManualFeatures({ ...manualFeatures, faceShape: shape })}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    manualFeatures.faceShape === shape
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="text-sm capitalize">{shape}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Skin Tone (Monk Scale) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skin Tone
            </label>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as MonkScale[]).map((tone) => (
                <button
                  key={tone}
                  onClick={() => setManualFeatures({ ...manualFeatures, skinTone: tone })}
                  className={`aspect-square rounded-lg border-2 transition-all ${
                    manualFeatures.skinTone === tone
                      ? 'border-purple-500 ring-2 ring-purple-300'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  style={{
                    backgroundColor: getSkinToneColor(tone),
                  }}
                  title={MONK_SCALE_NAMES[tone]}
                />
              ))}
            </div>
          </div>

          {/* Undertone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Undertone
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['warm', 'cool', 'neutral'] as SkinUndertone[]).map((undertone) => (
                <button
                  key={undertone}
                  onClick={() => setManualFeatures({ ...manualFeatures, undertone })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    manualFeatures.undertone === undertone
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <span className="capitalize font-medium">{undertone}</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {UNDERTONE_DESCRIPTIONS[undertone]}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Hair Type */}
          {category === 'hair' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hair Type
              </label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {(['3A', '3B', '3C', '4A', '4B', '4C'] as HairType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setManualFeatures({ ...manualFeatures, hairType: type })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      manualFeatures.hairType === type
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <span className="font-medium">{type}</span>
                    <p className="text-xs text-gray-500 mt-1">
                      {HAIR_TYPE_DESCRIPTIONS[type].split(' ')[0]}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Occasion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Occasion (optional)
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full p-3 rounded-xl border border-gray-200 focus:border-purple-500"
            >
              <option value="">Any occasion</option>
              <option value="everyday">Everyday</option>
              <option value="work">Work</option>
              <option value="wedding">Wedding</option>
              <option value="party">Party</option>
              <option value="vacation">Vacation</option>
              <option value="photoshoot">Photoshoot</option>
            </select>
          </div>

          <button
            onClick={handleGetRecommendations}
            disabled={loadingRecs || Object.keys(manualFeatures).length === 0}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loadingRecs ? 'Finding styles...' : 'Get My Recommendations ✨'}
          </button>
        </div>
      )}

      {/* Step: Results */}
      {step === 'results' && (
        <div className="space-y-6">
          <button
            onClick={() => setStep('select')}
            className="text-purple-600 hover:text-purple-800 flex items-center gap-1"
          >
            ← Start Over
          </button>

          <h2 className="text-xl font-semibold">
            Your Personalized Recommendations 🎉
          </h2>

          {/* Style Recommendations */}
          {styles.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Recommended Styles</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {styles.map((rec, index) => (
                  <div
                    key={rec.style.id}
                    className="rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => {
                      trackClick(rec.style.id);
                      onStyleSelect?.(rec.style.id);
                    }}
                  >
                    {/* Match Score Badge */}
                    <div className="relative bg-gradient-to-r from-purple-100 to-pink-100 p-4">
                      <span className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded-full text-xs font-medium">
                        {Math.round(rec.score * 100)}% match
                      </span>
                      <span className="text-2xl">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && '✨'}
                      </span>
                    </div>

                    <div className="p-4">
                      <h4 className="font-semibold text-lg">{rec.style.name}</h4>
                      
                      {/* Reasons */}
                      <ul className="mt-2 space-y-1">
                        {rec.reasons.slice(0, 2).map((reason, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start gap-1">
                            <span className="text-green-500">✓</span>
                            {reason}
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          trackSave(rec.style.id);
                        }}
                        className="mt-3 text-sm text-purple-600 hover:text-purple-800"
                      >
                        Save for later ❤️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No recommendations found. Try adjusting your preferences.</p>
            </div>
          )}

          {/* Freelancer Recommendations */}
          {freelancers.length > 0 && (
            <div className="space-y-4 mt-8">
              <h3 className="font-medium text-gray-700">Recommended Stylists</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {freelancers.slice(0, 4).map((rec) => (
                  <div
                    key={rec.freelancerId}
                    className="p-4 rounded-xl border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => onFreelancerSelect?.(rec.freelancerId)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {rec.freelancerName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{rec.freelancerName}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>⭐ {rec.averageRating.toFixed(1)}</span>
                          <span>•</span>
                          <span>{rec.completedBookings} bookings</span>
                        </div>
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1">
                      {rec.reasons.map((reason, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-1">
                          <span className="text-green-500">✓</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getSkinToneColor(monkScale: MonkScale): string {
  const colors: Record<MonkScale, string> = {
    1: '#FFF5E1',
    2: '#FFE4C4',
    3: '#DEB887',
    4: '#D2A679',
    5: '#C19A6B',
    6: '#A67B5B',
    7: '#8B6914',
    8: '#6B4423',
    9: '#4A3728',
    10: '#3D2B1F',
  };
  return colors[monkScale];
}
