import { api, Query } from "encore.dev/api";
import { z } from "zod";
import db from "../db";
import { validateSchema } from "../shared/validation";
import { getPostcodeCoordinates, calculateDistance } from "./geocoding";
import { checkAvailabilityPattern, TimePreference, AvailabilityMatch } from "./availability_matcher";

const searchSchema = z.object({
  location: z.string().optional(),
  keyword: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minRating: z.number().min(1).max(5).optional(),
  availableOnDate: z.string().optional(),
  availableThisWeekend: z.boolean().optional(),
  locationType: z.enum(['client_travels_to_freelancer', 'freelancer_travels_to_client']).optional(),
  sortBy: z.enum(['best_match', 'rating', 'price_low', 'distance']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional(),
  dayPattern: z.string().optional(),
  timeOfDay: z.string().optional(),
  specificDays: z.string().optional(),
  radiusMiles: z.number().min(1).max(100).optional(),
  verifiedOnly: z.boolean().optional(),
  experienceLevel: z.enum(['beginner', 'intermediate', 'expert']).optional(),
});

interface SearchParams {
  location?: Query<string>;
  keyword?: Query<string>;
  category?: Query<string>;
  minPrice?: Query<number>;
  maxPrice?: Query<number>;
  minRating?: Query<number>;
  availableOnDate?: Query<string>;
  availableThisWeekend?: Query<boolean>;
  locationType?: Query<string>;
  sortBy?: Query<string>;
  page?: Query<number>;
  limit?: Query<number>;
  dayPattern?: Query<string>;
  timeOfDay?: Query<string>;
  specificDays?: Query<string>;
  radiusMiles?: Query<number>;
  verifiedOnly?: Query<boolean>;
  experienceLevel?: Query<string>;
}

interface ServiceResult {
  id: number;
  freelancerId: string;
  freelancerName: string;
  freelancerPhoto: string | null;
  freelancerVerified: boolean;
  title: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  pricePence: number;
  durationMinutes: number;
  locationTypes: string[];
  averageRating: number;
  reviewCount: number;
  distanceMiles: number | null;
  freelancerPostcode: string;
  freelancerArea: string;
  freelancerCategories: string[];
  availabilityMatch?: AvailabilityMatch;
  avgResponseTimeHours: number | null;
  completionRate: number | null;
}

interface SearchResponse {
  results: ServiceResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  searchLocation?: {
    lat: number;
    lng: number;
    radiusMiles: number;
  };
}

export const search = api<SearchParams, SearchResponse>(
  { expose: true, method: "GET", path: "/search" },
  async (params): Promise<SearchResponse> => {
    const validated = validateSchema(searchSchema, params);
    const page = validated.page || 1;
    const limit = validated.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = ["s.is_active = true"];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (validated.verifiedOnly) {
      whereConditions.push("fp.verification_status = 'verified'");
    }

    if (validated.keyword) {
      whereConditions.push(`(s.title ILIKE $${paramIndex} OR s.description ILIKE $${paramIndex} OR s.subcategory ILIKE $${paramIndex})`);
      queryParams.push(`%${validated.keyword}%`);
      paramIndex++;
    }

    if (validated.category) {
      whereConditions.push(`s.category = $${paramIndex}`);
      queryParams.push(validated.category);
      paramIndex++;
    }

    if (validated.minPrice !== undefined) {
      whereConditions.push(`s.base_price_pence >= $${paramIndex}`);
      queryParams.push(validated.minPrice);
      paramIndex++;
    }

    if (validated.maxPrice !== undefined) {
      whereConditions.push(`s.base_price_pence <= $${paramIndex}`);
      queryParams.push(validated.maxPrice);
      paramIndex++;
    }

    if (validated.locationType) {
      whereConditions.push(`s.location_types::jsonb ? $${paramIndex}`);
      queryParams.push(validated.locationType);
      paramIndex++;
    }

    if (validated.experienceLevel) {
      let minYears = 0;
      let maxYears = 100;
      if (validated.experienceLevel === 'beginner') {
        maxYears = 2;
      } else if (validated.experienceLevel === 'intermediate') {
        minYears = 2;
        maxYears = 5;
      } else if (validated.experienceLevel === 'expert') {
        minYears = 5;
      }
      whereConditions.push(`fp.years_experience >= $${paramIndex} AND fp.years_experience <= $${paramIndex + 1}`);
      queryParams.push(minYears, maxYears);
      paramIndex += 2;
    }

    let userCoords: { lat: number; lng: number } | null = null;
    if (validated.location) {
      userCoords = getPostcodeCoordinates(validated.location);
    }

    const baseQuery = `
      SELECT 
        s.id,
        s.stylist_id as freelancer_id,
        s.title,
        s.category,
        s.subcategory,
        s.description,
        s.base_price_pence,
        s.duration_minutes,
        s.location_types,
        fp.display_name as freelancer_name,
        fp.profile_photo_url as freelancer_photo,
        fp.verification_status as freelancer_verification,
        fp.postcode as freelancer_postcode,
        fp.location_area as freelancer_area,
        fp.categories as freelancer_categories,
        fp.avg_response_time_hours,
        fp.completion_rate,
        COALESCE(AVG(r.rating), 0) as avg_rating,
        COUNT(r.id) as review_count
      FROM services s
      INNER JOIN freelancer_profiles fp ON s.stylist_id = fp.user_id
      LEFT JOIN bookings b ON s.id = b.service_id
      LEFT JOIN reviews r ON b.id = r.booking_id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY s.id, s.stylist_id, s.title, s.category, s.subcategory, s.description,
               s.base_price_pence, s.duration_minutes, s.location_types,
               fp.display_name, fp.profile_photo_url, fp.verification_status,
               fp.postcode, fp.location_area, fp.categories,
               fp.avg_response_time_hours, fp.completion_rate
    `;

    let havingClause = '';
    if (validated.minRating) {
      havingClause = ` HAVING COALESCE(AVG(r.rating), 0) >= $${paramIndex}`;
      queryParams.push(validated.minRating);
      paramIndex++;
    }

    let orderByClause = '';
    switch (validated.sortBy || 'best_match') {
      case 'rating':
        orderByClause = 'ORDER BY avg_rating DESC, review_count DESC';
        break;
      case 'price_low':
        orderByClause = 'ORDER BY s.base_price_pence ASC';
        break;
      case 'distance':
        orderByClause = 'ORDER BY s.id';
        break;
      case 'best_match':
      default:
        orderByClause = 'ORDER BY avg_rating DESC, review_count DESC, s.created_at DESC';
        break;
    }

    const query = `${baseQuery}${havingClause} ${orderByClause} LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    queryParams.push(limit + 1, offset);

    const rows = await db.rawQueryAll<{
      id: number;
      freelancer_id: string;
      title: string;
      category: string;
      subcategory: string | null;
      description: string | null;
      base_price_pence: number;
      duration_minutes: number;
      location_types: string[];
      freelancer_name: string;
      freelancer_photo: string | null;
      freelancer_verification: string;
      freelancer_postcode: string;
      freelancer_area: string;
      freelancer_categories: string[];
      avg_response_time_hours: string | null;
      completion_rate: string | null;
      avg_rating: string;
      review_count: string;
    }>(query, ...queryParams);

    const hasMore = rows.length > limit;
    const resultsToReturn = hasMore ? rows.slice(0, limit) : rows;

    let countQueryParams: any[] = [];
    let countParamIndex = 1;
    
    if (validated.keyword) {
      countQueryParams.push(`%${validated.keyword}%`);
      countParamIndex++;
    }
    if (validated.category) {
      countQueryParams.push(validated.category);
      countParamIndex++;
    }
    if (validated.minPrice !== undefined) {
      countQueryParams.push(validated.minPrice);
      countParamIndex++;
    }
    if (validated.maxPrice !== undefined) {
      countQueryParams.push(validated.maxPrice);
      countParamIndex++;
    }
    if (validated.locationType) {
      countQueryParams.push(validated.locationType);
      countParamIndex++;
    }
    if (validated.experienceLevel) {
      let minYears = 0;
      let maxYears = 100;
      if (validated.experienceLevel === 'beginner') {
        maxYears = 2;
      } else if (validated.experienceLevel === 'intermediate') {
        minYears = 2;
        maxYears = 5;
      } else if (validated.experienceLevel === 'expert') {
        minYears = 5;
      }
      countQueryParams.push(minYears, maxYears);
      countParamIndex += 2;
    }
    
    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM services s
      INNER JOIN freelancer_profiles fp ON s.stylist_id = fp.user_id
      LEFT JOIN bookings b ON s.id = b.service_id
      LEFT JOIN reviews r ON b.id = r.booking_id
      WHERE ${whereConditions.join(' AND ')}
      ${validated.minRating ? `GROUP BY s.id HAVING COALESCE(AVG(r.rating), 0) >= ${validated.minRating}` : ''}
    `;
    
    const countRows = await db.rawQueryAll<{ total: string }>(countQuery, ...countQueryParams);
    const total = validated.minRating ? countRows.length : (countRows[0] ? parseInt(countRows[0].total) : 0);

    const specificDaysArray = validated.specificDays 
      ? validated.specificDays.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d) && d >= 0 && d <= 6)
      : undefined;

    const timePreference: TimePreference | undefined = 
      (validated.dayPattern || validated.timeOfDay || specificDaysArray)
        ? {
            dayPattern: validated.dayPattern as 'weekday' | 'weekend' | 'any' | undefined,
            timeOfDay: validated.timeOfDay as 'morning' | 'afternoon' | 'evening' | 'any' | undefined,
            specificDays: specificDaysArray,
          }
        : undefined;

    // Calculate distances and filter by radius
    const radiusMiles = validated.radiusMiles || 50; // Default to 50 miles if not specified
    
    const results = await Promise.all(resultsToReturn.map(async row => {
      let distanceMiles: number | null = null;
      if (userCoords) {
        const freelancerCoords = getPostcodeCoordinates(row.freelancer_postcode);
        if (freelancerCoords) {
          distanceMiles = calculateDistance(
            userCoords.lat,
            userCoords.lng,
            freelancerCoords.lat,
            freelancerCoords.lng
          );
        }
      }

      let availabilityMatch: AvailabilityMatch | undefined;
      if (timePreference) {
        availabilityMatch = await checkAvailabilityPattern(row.freelancer_id, timePreference);
      }

      return {
        id: row.id,
        freelancerId: row.freelancer_id,
        freelancerName: row.freelancer_name,
        freelancerPhoto: row.freelancer_photo,
        freelancerVerified: row.freelancer_verification === 'verified',
        title: row.title,
        category: row.category,
        subcategory: row.subcategory,
        description: row.description,
        pricePence: row.base_price_pence,
        durationMinutes: row.duration_minutes,
        locationTypes: row.location_types,
        averageRating: parseFloat(row.avg_rating),
        reviewCount: parseInt(row.review_count),
        distanceMiles,
        freelancerPostcode: row.freelancer_postcode,
        freelancerArea: row.freelancer_area,
        freelancerCategories: row.freelancer_categories,
        availabilityMatch,
        avgResponseTimeHours: row.avg_response_time_hours ? parseFloat(row.avg_response_time_hours) : null,
        completionRate: row.completion_rate ? parseFloat(row.completion_rate) : null,
      };
    }));

    let filteredResults = results;
    
    // Filter by availability preference
    if (timePreference) {
      filteredResults = filteredResults.filter(r => r.availabilityMatch?.matched);
    }

    // Filter by radius if location was provided
    if (userCoords && validated.location) {
      filteredResults = filteredResults.filter(r => {
        if (r.distanceMiles === null) return true; // Include if we couldn't calculate distance
        return r.distanceMiles <= radiusMiles;
      });
    }

    // Sort results
    if (validated.sortBy === 'distance' && userCoords) {
      filteredResults.sort((a, b) => {
        if (a.distanceMiles === null) return 1;
        if (b.distanceMiles === null) return -1;
        return a.distanceMiles - b.distanceMiles;
      });
    }

    // Include user's search coordinates in response for map view
    const searchLocation = userCoords ? {
      lat: userCoords.lat,
      lng: userCoords.lng,
      radiusMiles,
    } : undefined;

    return {
      results: filteredResults,
      total: filteredResults.length,
      page,
      limit,
      hasMore: filteredResults.length > limit,
      searchLocation,
    };
  }
);
