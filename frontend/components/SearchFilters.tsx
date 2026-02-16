import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X, Filter, MapPin } from "lucide-react";

interface SearchFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  hideAvailability?: boolean;
  variant?: "default" | "sidebar";
  onClose?: () => void;
}

export interface FilterState {
  location: string;
  keyword: string;
  category: string;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  minRating: number | undefined;
  availableOnDate: string;
  availableThisWeekend: boolean;
  locationType: string;
  sortBy: string;
  dayPattern: string;
  timeOfDay: string;
  specificDays: number[];
  radiusMiles: number;
  verifiedOnly: boolean;
  experienceLevel: string;
  styleTags: string[];
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'hair', label: 'Hair' },
  { value: 'makeup', label: 'Makeup' },
  { value: 'gele', label: 'Gele' },
  { value: 'tailoring', label: 'Tailoring' },
  { value: 'barbering', label: 'Barbering' },
];

// Popular style tags for quick filtering
const popularStyleTags = [
  { value: 'knotless', label: 'Knotless Braids' },
  { value: 'box-braids', label: 'Box Braids' },
  { value: 'locs', label: 'Locs' },
  { value: 'weave', label: 'Weave' },
  { value: 'cornrows', label: 'Cornrows' },
  { value: 'twist', label: 'Twists' },
  { value: 'natural', label: 'Natural Hair' },
  { value: 'fade', label: 'Fade' },
  { value: 'bridal', label: 'Bridal' },
  { value: 'gele', label: 'Gele' },
];

const ratings = [
  { value: undefined, label: 'All Ratings' },
  { value: 4, label: '4+ Stars' },
];

const locationTypes = [
  { value: '', label: 'Any Location' },
  { value: 'freelancer_travels_to_client', label: 'Freelancer Travels' },
  { value: 'client_travels_to_freelancer', label: 'Client Travels' },
];

const sortOptions = [
  { value: 'best_match', label: 'Best Match' },
  { value: 'rating', label: 'Highest Rating' },
  { value: 'price_low', label: 'Lowest Price' },
  { value: 'distance', label: 'Closest' },
];

const dayPatterns = [
  { value: '', label: 'Any Day' },
  { value: 'weekday', label: 'Weekdays' },
  { value: 'weekend', label: 'Weekends' },
];

const timesOfDay = [
  { value: '', label: 'Any Time' },
  { value: 'morning', label: 'Morning (6am-12pm)' },
  { value: 'afternoon', label: 'Afternoon (12pm-6pm)' },
  { value: 'evening', label: 'Evening (6pm-10pm)' },
];

const experienceLevels = [
  { value: '', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner (0-2 years)' },
  { value: 'intermediate', label: 'Intermediate (2-5 years)' },
  { value: 'expert', label: 'Expert (5+ years)' },
];

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function SearchFilters({ filters, onChange, hideAvailability, variant = "default", onClose }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleChange = (key: keyof FilterState, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onChange({
      location: '',
      keyword: '',
      category: '',
      minPrice: undefined,
      maxPrice: undefined,
      minRating: undefined,
      availableOnDate: '',
      availableThisWeekend: false,
      locationType: '',
      sortBy: 'best_match',
      dayPattern: '',
      timeOfDay: '',
      specificDays: [],
      radiusMiles: 5,
      verifiedOnly: false,
      experienceLevel: '',
      styleTags: [],
    });
  };

  const toggleStyleTag = (tag: string) => {
    const current = filters.styleTags || [];
    const updated = current.includes(tag)
      ? current.filter(t => t !== tag)
      : [...current, tag];
    handleChange('styleTags', updated);
  };

  const toggleSpecificDay = (day: number) => {
    const current = filters.specificDays || [];
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day].sort((a, b) => a - b);
    handleChange('specificDays', updated);
  };

  const activeFilterCount = [
    filters.keyword,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
    hideAvailability ? null : filters.availableOnDate,
    hideAvailability ? null : filters.availableThisWeekend,
    filters.locationType,
    hideAvailability ? null : filters.dayPattern,
    hideAvailability ? null : filters.timeOfDay,
    hideAvailability ? null : (filters.specificDays?.length > 0 ? true : null),
    filters.verifiedOnly,
    filters.experienceLevel,
    (filters.styleTags?.length > 0 ? true : null),
  ].filter(Boolean).length;

  if (variant === "sidebar") {
    return (
      <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-4 space-y-6 sticky top-24">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#3a3a3a]">
          <h3 className="text-white font-bold flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </h3>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Location & Distance */}
        <div>
          <label className="text-sm font-semibold mb-3 block text-white flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            LOCATION & DISTANCE
          </label>
          <div className="space-y-3">
            <Input
              type="text"
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Brixton, London"
              className="bg-[#3a3a3a] border-[#4a4a4a] text-white placeholder:text-gray-500"
            />
            <div className="text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Search Radius</span>
                <span className="text-orange-500 font-bold">{filters.radiusMiles} miles</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={filters.radiusMiles}
                onChange={(e) => handleChange('radiusMiles', Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div className="border-t border-[#3a3a3a] pt-6">
          <h3 className="text-sm font-semibold mb-3 text-white">CATEGORY</h3>
          <div className="space-y-2">
            {categories.map(cat => (
              <label key={cat.value} className="flex items-center gap-3 cursor-pointer hover:bg-[#3a3a3a] p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={filters.category === cat.value || (cat.value === '' && !filters.category)}
                  onChange={(e) => handleChange('category', cat.value)}
                  className="w-4 h-4 accent-orange-500 rounded"
                />
                <span className="text-sm text-gray-300">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Service Type */}
        <div className="border-t border-[#3a3a3a] pt-6">
          <h3 className="text-sm font-semibold mb-3 text-white">SERVICE TYPE</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-[#3a3a3a] p-2 rounded transition-colors">
              <input
                type="radio"
                name="locationType"
                checked={filters.locationType === 'freelancer_travels_to_client'}
                onChange={() => handleChange('locationType', 'freelancer_travels_to_client')}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-sm text-gray-300">Mobile</span>
              <span className="ml-auto text-xs text-gray-500">They travel</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-[#3a3a3a] p-2 rounded transition-colors">
              <input
                type="radio"
                name="locationType"
                checked={filters.locationType === 'client_travels_to_freelancer'}
                onChange={() => handleChange('locationType', 'client_travels_to_freelancer')}
                className="w-4 h-4 accent-orange-500"
              />
              <span className="text-sm text-gray-300">Salon</span>
              <span className="ml-auto text-xs text-gray-500">You travel</span>
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div className="border-t border-[#3a3a3a] pt-6">
          <h3 className="text-sm font-semibold mb-3 text-white">PRICE RANGE</h3>
          <div className="flex gap-2">
            {['£', '££', '£££'].map((level) => {
              const isSelected = 
                (level === '£' && (!filters.minPrice || filters.minPrice <= 5000)) ||
                (level === '££' && filters.minPrice && filters.minPrice > 5000 && filters.minPrice <= 10000) ||
                (level === '£££' && filters.minPrice && filters.minPrice > 10000);
              
              return (
                <button
                  key={level}
                  onClick={() => {
                    if (level === '£') handleChange('minPrice', 0);
                    if (level === '££') handleChange('minPrice', 5001);
                    if (level === '£££') handleChange('minPrice', 10001);
                  }}
                  className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-orange-500 text-white'
                      : 'bg-[#3a3a3a] text-gray-400 hover:bg-[#4a4a4a]'
                  }`}
                >
                  {level}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rating */}
        <div className="border-t border-[#3a3a3a] pt-6">
          <h3 className="text-sm font-semibold mb-3 text-white">RATING</h3>
          <label className="flex items-center gap-3 cursor-pointer hover:bg-[#3a3a3a] p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={filters.minRating === 4}
              onChange={(e) => handleChange('minRating', e.target.checked ? 4 : undefined)}
              className="w-4 h-4 accent-orange-500 rounded"
            />
            <span className="text-sm text-gray-300 flex items-center gap-1">
              <span>4.0</span>
              <span className="text-orange-400">★</span>
              <span>& up</span>
            </span>
          </label>
        </div>

        {/* Available Today */}
        <div className="border-t border-[#3a3a3a] pt-6">
          <label className="flex items-center gap-3 cursor-pointer hover:bg-[#3a3a3a] p-2 rounded transition-colors">
            <input
              type="checkbox"
              checked={filters.availableThisWeekend}
              onChange={(e) => handleChange('availableThisWeekend', e.target.checked)}
              className="w-5 h-5 accent-orange-500 rounded"
            />
            <span className="text-sm text-white font-medium">Available Today</span>
          </label>
        </div>

        {/* Reset Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
          >
            Reset all
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        <Button
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2 border-2 text-sm"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 bg-orange-600 text-white">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium text-muted-foreground hidden md:block whitespace-nowrap">Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => handleChange('sortBy', e.target.value)}
            className="flex-1 md:flex-initial md:min-w-[200px] px-3 md:px-4 py-2 md:py-2.5 border-2 border-input bg-white rounded-lg text-xs md:text-sm font-medium hover:border-orange-600 focus:border-orange-600 focus:ring-2 focus:ring-orange-100 transition-colors"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 text-xs md:text-sm">
            <X className="h-3 w-3 md:h-4 md:w-4 mr-1" />
            <span className="hidden sm:inline">Reset All</span>
            <span className="sm:hidden">Reset</span>
          </Button>
        )}
      </div>

      {showFilters && (
        <Card className="p-4 md:p-6 space-y-4 md:space-y-6 bg-white border-2 border-gray-200 shadow-xl">
          <div className="flex items-center justify-between pb-3 md:pb-4 border-b border-gray-200">
            <h3 className="text-base md:text-lg font-bold text-gray-900">Search Filters</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilters(false)}
              className="text-gray-600 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div>
            <label className="text-sm font-semibold mb-3 block text-gray-900">Search Keywords</label>
            <Input
              type="text"
              value={filters.keyword}
              onChange={(e) => handleChange('keyword', e.target.value)}
              placeholder="e.g. braids, bridal, natural hair..."
              className="bg-white border-gray-300"
            />
            <p className="text-xs text-gray-500 mt-1">Search service names and descriptions</p>
          </div>

          <div className="pt-3 md:pt-4 border-t border-gray-200">
            <label className="text-sm font-semibold mb-2 md:mb-3 block text-gray-900">Search Radius</label>
            <div className="text-orange-600 font-bold text-lg mb-2">{filters.radiusMiles} miles</div>
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={filters.radiusMiles}
              onChange={(e) => handleChange('radiusMiles', Number(e.target.value))}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 mi</span>
              <span>50 mi</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Category</h3>
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="category"
                    value={cat.value}
                    checked={filters.category === cat.value}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm font-medium">{cat.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Popular Styles</h3>
            <div className="flex flex-wrap gap-2">
              {popularStyleTags.map(tag => {
                const isSelected = (filters.styleTags || []).includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    onClick={() => toggleStyleTag(tag.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">Select styles to filter results</p>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Service Type</h3>
            <div className="space-y-2">
              {locationTypes.map(type => (
                <label key={type.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="locationType"
                    value={type.value}
                    checked={filters.locationType === type.value}
                    onChange={(e) => handleChange('locationType', e.target.value)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Price Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 mb-2 block font-medium">Min (£)</label>
                <Input
                  type="number"
                  value={filters.minPrice ? filters.minPrice / 100 : ''}
                  onChange={(e) => handleChange('minPrice', e.target.value ? Number(e.target.value) * 100 : undefined)}
                  placeholder="0"
                  className="bg-white border-gray-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-2 block font-medium">Max (£)</label>
                <Input
                  type="number"
                  value={filters.maxPrice ? filters.maxPrice / 100 : ''}
                  onChange={(e) => handleChange('maxPrice', e.target.value ? Number(e.target.value) * 100 : undefined)}
                  placeholder="500"
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Rating</h3>
            <div className="space-y-2">
              {ratings.map(rating => (
                <label key={rating.label} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="rating"
                    value={rating.value || ''}
                    checked={(filters.minRating || '') === (rating.value || '')}
                    onChange={(e) => handleChange('minRating', e.target.value ? Number(e.target.value) : undefined)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm">{rating.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Verification</h3>
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => handleChange('verifiedOnly', e.target.checked)}
                className="w-5 h-5 accent-orange-500 rounded"
              />
              <span className="text-sm font-medium">Verified Freelancers Only</span>
            </label>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Experience Level</h3>
            <div className="space-y-2">
              {experienceLevels.map(level => (
                <label key={level.value} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <input
                    type="radio"
                    name="experienceLevel"
                    value={level.value}
                    checked={filters.experienceLevel === level.value}
                    onChange={(e) => handleChange('experienceLevel', e.target.value)}
                    className="w-4 h-4 accent-orange-500"
                  />
                  <span className="text-sm">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {!hideAvailability && (
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold mb-3 text-gray-900">Available Today</h3>
              <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={filters.availableThisWeekend}
                  onChange={(e) => handleChange('availableThisWeekend', e.target.checked)}
                  className="w-5 h-5 accent-orange-500 rounded"
                />
                <span className="text-sm font-medium">Available This Weekend</span>
              </label>
            </div>
          )}

        </Card>
      )}
    </div>
  );
}
