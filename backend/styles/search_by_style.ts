import { api, APIError, Query } from "encore.dev/api";
import { z } from "zod";
import db from "../db";
import { validateSchema } from "../shared/validation";
import { getPostcodeCoordinates, calculateDistance } from "../search/geocoding";

const searchByStyleSchema = z.object({
  styleId: z.number(),
  location: z.string().optional(),
  category: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  minRating: z.number().min(1).max(5).optional(),
  locationType: z.enum(['client_travels_to_freelancer', 'freelancer_travels_to_client']).optional(),
  sortBy: z.enum(['best_match', 'rating', 'price_low', 'distance']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional(),
});

type SearchByStyleInput = z.infer<typeof searchByStyleSchema>;

interface SearchByStyleParams {
  styleId: number;
  location?: Query<string>;
  category?: Query<string>;
  minPrice?: Query<number>;
  maxPrice?: Query<number>;
  minRating?: Query<number>;
  locationType?: Query<string>;
  sortBy?: Query<string>;
  page?: Query<number>;
  limit?: Query<number>;
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
  avgResponseTimeHours: number | null;
  completionRate: number | null;
}

interface StyleInfo {
  id: number;
  name: string;
  description: string | null;
  referenceImageUrl: string | null;
}

interface SearchByStyleResponse {
  style: StyleInfo;
  results: ServiceResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export const searchByStyle = api<SearchByStyleParams, SearchByStyleResponse>(
  { expose: true, method: "GET", path: "/styles/:styleId/search" },
  async (params): Promise<SearchByStyleResponse> => {
    const validated = validateSchema<SearchByStyleInput>(searchByStyleSchema, params);
    const page = validated.page || 1;
    const limit = validated.limit || 20;
    const offset = (page - 1) * limit;

    const style = await db.queryRow<{
      id: number;
      name: string;
      description: string | null;
      reference_image_url: string | null;
      is_active: boolean;
    }>`
      SELECT id, name, description, reference_image_url, is_active
      FROM styles
      WHERE id = ${validated.styleId}
    `;

    if (!style) {
      throw APIError.notFound("style not found");
    }

    if (!style.is_active) {
      throw APIError.notFound("style is not active");
    }

    let whereConditions: string[] = [
      "s.is_active = true",
      "fp.verification_status = 'verified'",
      "ss.style_id = $1"
    ];
    const queryParams: any[] = [validated.styleId];
    let paramIndex = 2;

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
      INNER JOIN service_styles ss ON s.id = ss.service_id
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
      location_types: string;
      freelancer_name: string;
      freelancer_photo: string | null;
      freelancer_verification: string;
      freelancer_postcode: string;
      freelancer_area: string;
      freelancer_categories: string;
      avg_response_time_hours: string | null;
      completion_rate: string | null;
      avg_rating: string;
      review_count: string;
    }>(query, ...queryParams);

    const hasMore = rows.length > limit;
    const resultsToReturn = hasMore ? rows.slice(0, limit) : rows;

    const countQuery = `
      SELECT COUNT(DISTINCT s.id) as total
      FROM services s
      INNER JOIN service_styles ss ON s.id = ss.service_id
      INNER JOIN freelancer_profiles fp ON s.stylist_id = fp.user_id
      LEFT JOIN bookings b ON s.id = b.service_id
      LEFT JOIN reviews r ON b.id = r.booking_id
      WHERE ${whereConditions.join(' AND ')}
    `;
    const countResult = await db.rawQueryRow<{ total: string }>(countQuery, ...queryParams.slice(0, paramIndex - 2));
    const total = countResult ? parseInt(countResult.total) : 0;

    const results = resultsToReturn.map(row => {
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
        locationTypes: JSON.parse(row.location_types),
        averageRating: parseFloat(row.avg_rating),
        reviewCount: parseInt(row.review_count),
        distanceMiles,
        freelancerPostcode: row.freelancer_postcode,
        freelancerArea: row.freelancer_area,
        freelancerCategories: JSON.parse(row.freelancer_categories),
        avgResponseTimeHours: row.avg_response_time_hours ? parseFloat(row.avg_response_time_hours) : null,
        completionRate: row.completion_rate ? parseFloat(row.completion_rate) : null,
      };
    });

    if (validated.sortBy === 'distance' && userCoords) {
      results.sort((a, b) => {
        if (a.distanceMiles === null) return 1;
        if (b.distanceMiles === null) return -1;
        return a.distanceMiles - b.distanceMiles;
      });
    }

    return {
      style: {
        id: style.id,
        name: style.name,
        description: style.description,
        referenceImageUrl: style.reference_image_url,
      },
      results,
      total,
      page,
      limit,
      hasMore,
    };
  }
);
