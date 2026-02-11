# Braida AI Recommendation System - Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Feature Extraction](#feature-extraction)
4. [Recommendation Algorithms](#recommendation-algorithms)
5. [Bias Monitoring & Fairness](#bias-monitoring--fairness)
6. [API Reference](#api-reference)
7. [Frontend Integration](#frontend-integration)
8. [Database Schema](#database-schema)
9. [Deployment Guide](#deployment-guide)
10. [Testing](#testing)
11. [R&D Roadmap](#rd-roadmap)

---

## Overview

The Braida AI Recommendation System provides personalized beauty style recommendations based on:

- **Facial Structure Analysis** - Face shape detection (oval, round, square, heart, oblong, diamond)
- **Skin Tone Analysis** - Using the Monk 10-point scale (more inclusive than Fitzpatrick)
- **Hair Type Classification** - Andre Walker system (3A-4C) with focus on textured hair
- **Undertone Detection** - Warm, cool, or neutral undertones

### Key Features

- ✅ Personalized style recommendations
- ✅ Freelancer matching based on expertise
- ✅ Bias monitoring and fairness auditing
- ✅ Privacy-preserving image analysis
- ✅ Collaborative filtering from similar users
- ✅ Knowledge graph for expert style rules

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BRAIDA AI RECOMMENDATION ENGINE               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│  │ User Image   │   │ User Profile │   │ Style Prefs  │        │
│  │ Analysis     │   │ Data         │   │ History      │        │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘        │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              FEATURE EXTRACTION LAYER                 │       │
│  │  • Face Shape  • Skin Tone  • Hair Type  • Occasion  │       │
│  └──────────────────────────┬───────────────────────────┘       │
│                              │                                   │
│         ┌────────────────────┼────────────────────┐             │
│         ▼                    ▼                    ▼              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │Content-Based│     │Collaborative│     │ Knowledge   │       │
│  │ Filtering   │     │ Filtering   │     │ Graph       │       │
│  └──────┬──────┘     └──────┬──────┘     └──────┬──────┘       │
│         │                    │                    │              │
│         └────────────────────┼────────────────────┘             │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │            HYBRID ENSEMBLE SCORING                    │       │
│  │     (Weighted combination with bias adjustment)       │       │
│  └──────────────────────────┬───────────────────────────┘       │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────┐       │
│  │         RANKED RECOMMENDATIONS                        │       │
│  │  • Styles  • Freelancers  • Colors  • Products       │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
backend/
├── ai/
│   ├── encore.service.ts       # Service definition
│   ├── types.ts                # TypeScript type definitions
│   ├── feature_extraction.ts   # Face, skin, hair analysis
│   ├── recommendation_engine.ts # Hybrid recommendation system
│   ├── bias_monitoring.ts      # Fairness auditing
│   └── endpoints.ts            # API endpoints
└── db/
    └── migrations/
        └── 057_ai_recommendation_system.up.sql

frontend/
├── hooks/
│   └── useAIRecommendations.ts # React hooks for AI features
├── components/
│   └── ai/
│       ├── AIStyleFinder.tsx   # Main style finder component
│       └── BeautyProfile.tsx   # User profile component
└── pages/
    └── ai/
        └── AIRecommendationsPage.tsx
```

---

## Feature Extraction

### Face Shape Analysis

Uses 68-point facial landmarks to classify face shape based on:

- **Width-to-Height Ratio**: Determines if face is round vs oblong
- **Forehead-to-Jaw Ratio**: Identifies heart vs square shapes
- **Cheekbone Prominence**: Detects diamond face shapes

```typescript
// Classification rules
if (widthToHeightRatio < 0.75) return 'oblong';
if (widthToHeightRatio > 0.9 && cheekboneProminence < 0.1) return 'round';
if (foreheadToJawRatio > 1.2) return 'heart';
if (cheekboneProminence > 0.15) return 'diamond';
if (widthToHeightRatio > 0.85 && foreheadWidth ≈ jawWidth) return 'square';
return 'oval'; // Default balanced shape
```

### Skin Tone Analysis (Monk Scale)

Uses the **Monk 10-point scale** instead of Fitzpatrick for better representation:

| Monk Scale | Name | ITA Range |
|------------|------|-----------|
| 1 | Very Light | > 55° |
| 2 | Light | 45° - 55° |
| 3 | Light Medium | 35° - 45° |
| 4 | Medium Light | 25° - 35° |
| 5 | Medium | 15° - 25° |
| 6 | Medium Tan | 5° - 15° |
| 7 | Tan | -5° - 5° |
| 8 | Brown | -15° - -5° |
| 9 | Dark Brown | -30° - -15° |
| 10 | Deep Brown | < -30° |

**ITA (Individual Typology Angle)** calculation:
```
ITA = arctan((L* - 50) / b*) × (180/π)
```

Where L* and b* are from the LAB color space.

### Undertone Detection

Based on Sony's research on hue angles:

- **Warm**: Hue angle > 50° (yellow-leaning)
- **Cool**: Hue angle < 40° (red-leaning)
- **Neutral**: 40° - 50°

### Hair Type Classification

Andre Walker Hair Typing System with focus on Type 3-4:

| Type | Description | Characteristics |
|------|-------------|-----------------|
| 3A | Loose Curls | S-pattern, large curls |
| 3B | Medium Curls | Springy ringlets |
| 3C | Tight Curls | Corkscrew curls |
| 4A | Coily Defined | S-pattern coils |
| 4B | Coily Z-Pattern | Sharp angle coils |
| 4C | Coily Tight | Densely packed, less defined |

---

## Recommendation Algorithms

### Content-Based Filtering

Matches user features to style compatibility scores:

```typescript
score = 
  faceShapeMatch × 0.25 +
  skinToneMatch × 0.20 +
  hairTypeMatch × 0.25 +
  preferenceMatch × 0.20 +
  popularityScore × 0.10
```

### Collaborative Filtering

Finds similar users based on:
- Physical attributes (50% weight)
- Service preferences (30% weight)
- Location proximity (20% weight)

### Hybrid Combination

Final score combines both approaches:
```typescript
hybridScore = contentScore × 0.7 + collaborativeScore × 0.3
```

---

## Bias Monitoring & Fairness

### Metrics Tracked

1. **Skin Tone Disparity**: Performance gap between light/medium/dark groups
2. **Hair Type Disparity**: Performance gap across 3A-4C types
3. **Intersectional Disparity**: Combined attribute analysis (e.g., dark skin + 4C hair)

### Audit Process

```typescript
// Run comprehensive audit
const result = await biasAuditor.runComprehensiveAudit();

// Returns:
{
  overallFairness: 0.85,  // 0-1, higher is better
  skinToneBias: { disparity: 0.12, groupPerformance: {...} },
  hairTypeBias: { disparity: 0.15, groupPerformance: {...} },
  recommendations: [
    "4C hair type is underperforming...",
    "Consider adding more styles for dark skin tones..."
  ]
}
```

### Mitigation Strategies

1. **Pre-processing**: Balance training data across demographics
2. **In-processing**: Add fairness constraints to model training
3. **Post-processing**: Boost recommendations for underserved groups

---

## API Reference

### Image Analysis

```
POST /ai/analyze-image
```

**Request:**
```json
{
  "imageUrl": "https://...",
  "imageBase64": "...",
  "analysisTypes": ["face_shape", "skin_tone", "hair_type"]
}
```

**Response:**
```json
{
  "success": true,
  "faceShape": {
    "shape": "oval",
    "confidence": 0.85
  },
  "skinTone": {
    "monkScale": 7,
    "undertone": "warm",
    "confidence": 0.88
  },
  "hairAnalysis": {
    "hairType": "4B",
    "density": "thick",
    "confidence": 0.82
  },
  "processingTime": 1250,
  "savedToProfile": true
}
```

### Get Recommendations

```
GET /ai/recommendations?category=hair&occasion=wedding
```

**Response:**
```json
{
  "styles": [
    {
      "style": {
        "id": "style_knotless_box",
        "name": "Knotless Box Braids",
        "category": "hair",
        "maintenanceLevel": "medium",
        "durationWeeks": 8
      },
      "score": 0.87,
      "reasons": [
        "Flatters your oval face shape",
        "Works beautifully with 4B hair",
        "Low maintenance style"
      ],
      "matchFactors": {
        "faceShapeMatch": 0.9,
        "skinToneMatch": 0.85,
        "hairTypeMatch": 0.95,
        "preferenceMatch": 0.7
      }
    }
  ],
  "freelancers": [
    {
      "freelancerId": "freelancer_123",
      "freelancerName": "Aisha Johnson",
      "score": 0.92,
      "reasons": ["Experienced with 4B hair", "Highly rated"],
      "averageRating": 4.8,
      "completedBookings": 156
    }
  ]
}
```

### Other Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/ai/user-features` | GET | Get user's analyzed features |
| `/ai/user-features` | PUT | Update features manually |
| `/ai/user-preferences` | PUT | Update style preferences |
| `/ai/styles` | GET | Browse style catalog |
| `/ai/styles/:id` | GET | Get style details |
| `/ai/track-interaction` | POST | Track user interactions |
| `/ai/admin/bias-audit` | POST | Run bias audit (admin) |
| `/ai/admin/analytics` | GET | Get analytics (admin) |

---

## Frontend Integration

### Using the Hooks

```tsx
import { 
  useUserFeatures, 
  useImageAnalysis, 
  useRecommendations 
} from '@/hooks/useAIRecommendations';

function MyComponent() {
  const { features, hasAnalysis } = useUserFeatures();
  const { analyzing, analyzeImage, result } = useImageAnalysis();
  const { styles, freelancers, getRecommendations } = useRecommendations();

  // Upload and analyze image
  const handleUpload = async (file) => {
    await analyzeImage(file);
  };

  // Get recommendations
  const handleGetRecs = async () => {
    await getRecommendations({
      category: 'hair',
      occasion: 'wedding',
    });
  };

  return (
    <div>
      {hasAnalysis ? (
        <p>Face: {features.faceShape?.shape}</p>
      ) : (
        <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      )}
    </div>
  );
}
```

### Adding Components to Routes

```tsx
// In App.tsx or routes config
import AIRecommendationsPage from '@/pages/ai/AIRecommendationsPage';

<Route path="/ai/recommendations" element={<AIRecommendationsPage />} />
```

---

## Database Schema

### Key Tables

1. **user_features** - Stores analyzed user features
2. **style_definitions** - Style catalog with compatibility data
3. **style_compatibility_scores** - Pre-computed match scores
4. **freelancer_capabilities** - Freelancer expertise tracking
5. **recommendation_logs** - Audit log for recommendations
6. **bias_audit_logs** - Fairness monitoring results
7. **user_style_interactions** - User interaction tracking

### Running Migrations

```bash
# Apply the AI migration
cd backend
encore db migrate
```

---

## Deployment Guide

### 1. Apply Database Migration

```bash
encore db migrate
```

### 2. Deploy Backend

```bash
git add backend/ai/
git commit -m "Add AI recommendation system"
git push encore main
```

### 3. Deploy Frontend

The frontend components will be included in the normal frontend build process.

### 4. Configure Environment

Required secrets (if using ML model APIs):
- `ML_MODEL_API_KEY` - For external ML model access
- `IMAGE_PROCESSING_API_KEY` - For image analysis service

---

## Testing

### Backend Tests

```typescript
// backend/ai/tests/recommendation_engine.test.ts

import { describe, it, expect } from 'vitest';
import { ContentBasedRecommender } from '../recommendation_engine';
import { UserFeatures } from '../types';

describe('ContentBasedRecommender', () => {
  const recommender = new ContentBasedRecommender();

  it('should recommend styles matching face shape', async () => {
    const userFeatures: UserFeatures = {
      userId: 'test-user',
      faceShape: {
        shape: 'round',
        landmarks: {},
        widthToHeightRatio: 0.9,
        foreheadToJawRatio: 1.0,
        confidence: 0.85,
      },
    };

    const recommendations = await recommender.recommendStyles(
      userFeatures,
      'hair'
    );

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].matchFactors.faceShapeMatch).toBeGreaterThan(0.5);
  });

  it('should recommend styles for 4C hair type', async () => {
    const userFeatures: UserFeatures = {
      userId: 'test-user',
      hairAnalysis: {
        hairType: '4C',
        density: 'thick',
        porosity: 'normal',
        lengthCategory: 'medium',
        textureFeatures: {},
        confidence: 0.88,
      },
    };

    const recommendations = await recommender.recommendStyles(
      userFeatures,
      'hair'
    );

    expect(recommendations.some(r => 
      r.style.name.toLowerCase().includes('braid') ||
      r.style.name.toLowerCase().includes('twist') ||
      r.style.name.toLowerCase().includes('loc')
    )).toBe(true);
  });
});

describe('BiasAuditor', () => {
  it('should detect skin tone disparity', async () => {
    const auditor = new BiasAuditor();
    const result = await auditor.auditSkinToneBias();

    expect(result.skinToneDisparity).toBeDefined();
    expect(result.groupPerformance).toHaveProperty('light');
    expect(result.groupPerformance).toHaveProperty('dark');
  });
});
```

### Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Run bias audit
curl -X POST http://localhost:4000/ai/admin/bias-audit \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## R&D Roadmap

### Phase 1: Foundation (Months 1-3) ✅

- [x] Database schema for AI features
- [x] Feature extraction algorithms
- [x] Content-based recommendation engine
- [x] Basic API endpoints
- [x] Frontend components

### Phase 2: ML Models (Months 4-6)

- [ ] Train CNN for face shape classification
- [ ] Train ResNet for hair type classification
- [ ] Implement proper skin segmentation
- [ ] Collect diverse training dataset
- [ ] Deploy models to cloud inference

### Phase 3: Advanced Matching (Months 7-9)

- [ ] Knowledge graph for expert rules
- [ ] Improved collaborative filtering
- [ ] A/B testing framework
- [ ] Real-time bias monitoring dashboard

### Phase 4: Personalization (Months 10-12)

- [ ] Neural collaborative filtering
- [ ] Transformer-based embeddings
- [ ] AR/Virtual try-on integration
- [ ] Explainable AI features

---

## Success Metrics

### Business Metrics

| Metric | Target |
|--------|--------|
| Recommendation CTR | > 15% |
| Booking Conversion | > 5% |
| User Satisfaction | > 4.5/5 |
| Repeat Bookings | > 30% |

### Fairness Metrics

| Metric | Target |
|--------|--------|
| Skin Tone Parity | < 10% gap |
| Hair Type Coverage | 100% |
| 4C Performance | ≥ 80% avg |

---

*Last updated: February 2026 | Version: 1.0.0*
