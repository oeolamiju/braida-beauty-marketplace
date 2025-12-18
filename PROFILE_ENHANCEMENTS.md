# Freelancer Profile Page Enhancements

## Overview
Enhanced the freelancer/professional profile page with comprehensive features for managing profile information, portfolio images, and style offerings.

## Features Implemented

### 1. Profile Photo Management
- **Location**: Top of profile page in dedicated card section
- **Features**:
  - Large circular profile photo display (128x128px)
  - Professional placeholder when no photo is set
  - Easy upload interface with drag-and-drop support
  - Upload progress indicator with loading animation
  - Photo can be changed at any time
  - Validates file size (max 5MB) and format (JPEG, PNG)

### 2. Service Category Selection
- **Location**: Basic Information section
- **Features**:
  - Four main categories: Hair, Makeup, Gele, Tailoring
  - Visual badge interface with checkmarks for selected categories
  - At least one category must be selected
  - Categories determine which styles are available to select

### 3. Style Offerings Selection
- **Location**: Dedicated "Styles Offered" card section
- **Features**:
  - Styles automatically grouped by selected service categories
  - Each style displays:
    - Name (e.g., "Knotless Box Braids")
    - Description explaining the style
  - Interactive card-based selection interface
  - Selected styles show checkmark indicator and highlighted border
  - Styles are filtered to only show relevant ones for selected categories
  - Categorization logic:
    - **Hair**: Braids, locs, wigs, natural hair styles
    - **Makeup**: Soft glam, bridal makeup, etc.
    - **Gele**: Traditional head wraps
    - **Tailoring**: Aso-ebi, alterations, custom garments

### 4. Portfolio Image Gallery
- **Location**: Bottom of profile page in dedicated card section
- **Features**:
  - Upload up to 20 portfolio images
  - Optional captions for each image (e.g., "Bridal makeup for outdoor wedding")
  - Responsive grid layout (1-3 columns depending on screen size)
  - Image preview before upload
  - Delete capability with hover-based delete button
  - Counter showing current/max images (e.g., "5/20")
  - Upload disabled when limit reached
  - Large image display (48-64 height units)

## Technical Implementation

### Backend Changes

#### New Migration: `032_freelancer_styles.up.sql`
- Created `freelancer_styles` junction table linking freelancers to styles
- Indexes for efficient queries on both freelancer_id and style_id

#### Updated Endpoints:

**`/backend/profiles/get_profile.ts`**
- Added `styleIds: number[]` to FreelancerProfile interface
- Queries `freelancer_styles` table to retrieve selected styles
- Returns style IDs along with other profile data

**`/backend/profiles/update_profile.ts`**
- Added `styleIds?: number[]` to UpdateProfileRequest
- Deletes existing style associations when updating
- Inserts new style associations atomically
- Validates user is a freelancer before allowing updates

**`/backend/profiles/confirm_profile_photo.ts`** (New)
- Confirms uploaded profile photo and returns public URL
- Validates photo exists in storage bucket
- Returns URL for immediate use in profile

### Frontend Changes

#### New Components:

**`/frontend/components/ProfilePhotoUploader.tsx`**
- Specialized uploader for profile photos
- Uses `/api/profiles/photo/upload-url` endpoint
- Shows circular preview during upload
- Progress indicator with percentage

#### Updated Pages:

**`/frontend/pages/freelancer/Profile.tsx`**
- Complete redesign with multiple card sections:
  1. Profile Photo card (new)
  2. Basic Information card
  3. Styles Offered card (new)
  4. Portfolio card (enhanced)
  
- New state management:
  - `allStyles`: All available styles from backend
  - `selectedStyles`: Currently selected style IDs
  - `uploadingPhoto`: Photo upload state
  
- Style categorization logic:
  - `getStylesByCategory()`: Groups styles by service category
  - Uses keyword matching to categorize styles intelligently
  
- Enhanced UX:
  - Category selection must happen before style selection
  - Styles filtered dynamically based on categories
  - Clear visual feedback for selections
  - Helpful placeholder messages

## User Flow

1. **Initial Setup**:
   - Upload profile photo (recommended but optional)
   - Fill in basic information (name, bio, location)
   - Select at least one service category

2. **Style Selection**:
   - After selecting categories, relevant styles appear
   - Click/tap styles to select (multiple selection allowed)
   - Visual feedback shows selected vs unselected

3. **Portfolio Building**:
   - Add caption (optional)
   - Upload image
   - Repeat up to 20 images
   - Delete unwanted images anytime

4. **Save Changes**:
   - Single "Save Profile" button updates all settings
   - Includes categories, styles, and basic info
   - Profile photo saves independently on upload

## Database Schema

### freelancer_styles table
```sql
CREATE TABLE freelancer_styles (
  freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  style_id BIGINT NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (freelancer_id, style_id)
);
```

## API Endpoints

- `GET /profiles/:userId` - Get profile with style IDs
- `PUT /profiles/me` - Update profile including styles
- `POST /profiles/photo/upload-url` - Get signed URL for profile photo upload
- `POST /profiles/photo/confirm` - Confirm photo upload and get public URL
- `POST /profiles/portfolio/upload-url` - Get signed URL for portfolio image
- `POST /profiles/portfolio` - Save portfolio item with caption
- `DELETE /profiles/portfolio/:itemId` - Delete portfolio item
- `GET /styles` - List all active styles

## Validation

### Profile Photo:
- Max size: 5MB
- Formats: JPEG, PNG, JPG
- Public storage bucket: `profile-photos`

### Portfolio Images:
- Max count: 20 images per freelancer
- Max size: 5MB per image
- Formats: JPEG, PNG, JPG
- Optional caption: max length handled by database
- Public storage bucket: `portfolio-images`

### Styles:
- Must select at least one category
- Styles are filtered by category
- Only active styles are shown

## Styling & Responsiveness

- Mobile-first design
- Responsive grid layouts
- Touch-friendly click targets
- Smooth transitions and hover effects
- Consistent with existing design system
- Uses Tailwind CSS v4 syntax
- Dark mode compatible via CSS variables

## Notes

- Profile photo uploads use a two-step process: get signed URL, then upload to storage
- Portfolio images follow the same upload pattern
- Style categorization uses keyword matching for flexibility
- All changes are persisted to PostgreSQL database
- Images stored in Encore's object storage buckets
