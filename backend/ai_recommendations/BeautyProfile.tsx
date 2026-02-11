// =============================================================================
// BRAIDA AI - BEAUTY PROFILE COMPONENT
// Component for managing and displaying user's AI-analyzed beauty profile
// =============================================================================

import React, { useState } from 'react';
import {
  useUserFeatures,
  useImageAnalysis,
  FaceShape,
  HairType,
  MonkScale,
  SkinUndertone,
  MONK_SCALE_NAMES,
  HAIR_TYPE_DESCRIPTIONS,
  FACE_SHAPE_DESCRIPTIONS,
  UNDERTONE_DESCRIPTIONS,
} from '../../hooks/useAIRecommendations';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface BeautyProfileProps {
  editable?: boolean;
  showAnalyzeOption?: boolean;
  onProfileUpdate?: () => void;
}

export default function BeautyProfile({
  editable = true,
  showAnalyzeOption = true,
  onProfileUpdate,
}: BeautyProfileProps) {
  const { features, loading, error, updateFeatures, hasAnalysis } = useUserFeatures();
  const { analyzing, analyzeImage } = useImageAnalysis();
  const [isEditing, setIsEditing] = useState(false);
  const [editedFeatures, setEditedFeatures] = useState<{
    faceShape?: FaceShape;
    skinTone?: MonkScale;
    undertone?: SkinUndertone;
    hairType?: HairType;
  }>({});

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await analyzeImage(file);
      onProfileUpdate?.();
    }
  };

  const handleSaveChanges = async () => {
    await updateFeatures({
      faceShape: editedFeatures.faceShape,
      skinTone: editedFeatures.skinTone,
      undertone: editedFeatures.undertone,
      hairType: editedFeatures.hairType,
    });
    setIsEditing(false);
    onProfileUpdate?.();
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
        <p>Failed to load beauty profile: {error}</p>
      </div>
    );
  }

  // No analysis yet
  if (!hasAnalysis) {
    return (
      <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
        <div className="text-5xl mb-4">✨</div>
        <h3 className="text-xl font-semibold mb-2">Create Your Beauty Profile</h3>
        <p className="text-gray-600 mb-6">
          Get personalized style recommendations tailored to your unique features
        </p>

        {showAnalyzeOption && (
          <div className="space-y-4">
            <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium cursor-pointer hover:shadow-lg transition-all">
              {analyzing ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Analyzing...
                </>
              ) : (
                <>
                  📷 Upload a Photo
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={analyzing}
              />
            </label>
            <p className="text-sm text-gray-500">
              or{' '}
              <button
                onClick={() => setIsEditing(true)}
                className="text-purple-600 hover:underline"
              >
                enter your features manually
              </button>
            </p>
          </div>
        )}
      </div>
    );
  }

  // Display profile
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Beauty Profile</h2>
        {editable && !isEditing && (
          <button
            onClick={() => {
              setEditedFeatures({
                faceShape: features?.faceShape?.shape,
                skinTone: features?.skinTone?.monkScale,
                undertone: features?.skinTone?.undertone,
                hairType: features?.hairAnalysis?.hairType,
              });
              setIsEditing(true);
            }}
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
        <EditableProfile
          editedFeatures={editedFeatures}
          setEditedFeatures={setEditedFeatures}
          onSave={handleSaveChanges}
          onCancel={() => setIsEditing(false)}
          loading={loading}
        />
      ) : (
        <ProfileDisplay features={features!} />
      )}

      {/* Re-analyze option */}
      {showAnalyzeOption && !isEditing && (
        <div className="pt-4 border-t border-gray-100">
          <label className="inline-flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-purple-600">
            {analyzing ? (
              <>
                <span className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></span>
                Analyzing...
              </>
            ) : (
              <>
                📷 Re-analyze with a new photo
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={analyzing}
            />
          </label>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// PROFILE DISPLAY COMPONENT
// =============================================================================

function ProfileDisplay({ features }: { features: NonNullable<ReturnType<typeof useUserFeatures>['features']> }) {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Face Shape Card */}
      {features.faceShape && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">😊</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Face Shape</p>
              <p className="font-semibold capitalize text-lg">{features.faceShape.shape}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {FACE_SHAPE_DESCRIPTIONS[features.faceShape.shape]}
          </p>
          {features.faceShape.confidence && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Confidence</span>
                <span>{Math.round(features.faceShape.confidence * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${features.faceShape.confidence * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Skin Tone Card */}
      {features.skinTone && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-white shadow"
              style={{ backgroundColor: getSkinToneColor(features.skinTone.monkScale) }}
            />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Skin Tone</p>
              <p className="font-semibold text-lg">
                {MONK_SCALE_NAMES[features.skinTone.monkScale]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-0.5 rounded-full bg-white/50 text-gray-700 capitalize">
              {features.skinTone.undertone} undertone
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {UNDERTONE_DESCRIPTIONS[features.skinTone.undertone]}
          </p>
        </div>
      )}

      {/* Hair Type Card */}
      {features.hairAnalysis && (
        <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">💇🏾‍♀️</span>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Hair Type</p>
              <p className="font-semibold text-lg">{features.hairAnalysis.hairType}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {HAIR_TYPE_DESCRIPTIONS[features.hairAnalysis.hairType]}
          </p>
          {features.hairAnalysis.density && (
            <div className="mt-2 flex gap-2">
              <span className="px-2 py-0.5 rounded-full bg-white/50 text-gray-700 text-xs capitalize">
                {features.hairAnalysis.density} density
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// EDITABLE PROFILE COMPONENT
// =============================================================================

interface EditableProfileProps {
  editedFeatures: {
    faceShape?: FaceShape;
    skinTone?: MonkScale;
    undertone?: SkinUndertone;
    hairType?: HairType;
  };
  setEditedFeatures: React.Dispatch<React.SetStateAction<EditableProfileProps['editedFeatures']>>;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}

function EditableProfile({
  editedFeatures,
  setEditedFeatures,
  onSave,
  onCancel,
  loading,
}: EditableProfileProps) {
  return (
    <div className="space-y-6 p-6 rounded-xl bg-gray-50 border border-gray-200">
      {/* Face Shape */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Face Shape
        </label>
        <div className="flex flex-wrap gap-2">
          {(['oval', 'round', 'square', 'heart', 'oblong', 'diamond'] as FaceShape[]).map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => setEditedFeatures({ ...editedFeatures, faceShape: shape })}
              className={`px-4 py-2 rounded-lg border transition-all ${
                editedFeatures.faceShape === shape
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <span className="capitalize">{shape}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Skin Tone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Skin Tone (Monk Scale)
        </label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as MonkScale[]).map((tone) => (
            <button
              key={tone}
              type="button"
              onClick={() => setEditedFeatures({ ...editedFeatures, skinTone: tone })}
              className={`w-10 h-10 rounded-lg border-2 transition-all ${
                editedFeatures.skinTone === tone
                  ? 'border-purple-500 ring-2 ring-purple-300'
                  : 'border-transparent hover:border-purple-300'
              }`}
              style={{ backgroundColor: getSkinToneColor(tone) }}
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
        <div className="flex gap-3">
          {(['warm', 'cool', 'neutral'] as SkinUndertone[]).map((undertone) => (
            <button
              key={undertone}
              type="button"
              onClick={() => setEditedFeatures({ ...editedFeatures, undertone })}
              className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                editedFeatures.undertone === undertone
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              <span className="capitalize">{undertone}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hair Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Hair Type
        </label>
        <div className="flex flex-wrap gap-2">
          {(['3A', '3B', '3C', '4A', '4B', '4C'] as HairType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setEditedFeatures({ ...editedFeatures, hairType: type })}
              className={`px-4 py-2 rounded-lg border transition-all ${
                editedFeatures.hairType === type
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 hover:border-purple-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={loading}
          className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
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
