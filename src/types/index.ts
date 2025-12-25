// Strava API Types

export interface StravaTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
}

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  profile: string;
  profile_medium: string;
  premium: boolean;
  created_at: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  sport_type: string;
  type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  start_latlng: [number, number] | null;
  end_latlng: [number, number] | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  average_speed: number;
  max_speed: number;
  average_heartrate?: number;
  max_heartrate?: number;
  pr_count: number;
  achievement_count: number;
  workout_type?: number;
}

export interface StravaStats {
  biggest_ride_distance: number;
  biggest_climb_elevation_gain: number;
  recent_ride_totals: ActivityTotal;
  recent_run_totals: ActivityTotal;
  recent_swim_totals: ActivityTotal;
  ytd_ride_totals: ActivityTotal;
  ytd_run_totals: ActivityTotal;
  ytd_swim_totals: ActivityTotal;
  all_ride_totals: ActivityTotal;
  all_run_totals: ActivityTotal;
  all_swim_totals: ActivityTotal;
}

interface ActivityTotal {
  count: number;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  elevation_gain: number;
  achievement_count?: number;
}

// Computed Stats Types
export interface SportStats {
  sport: string;
  activityCount: number;
  totalDistance: number;
  totalTime: number;
  totalElevation: number;
  longestActivity: number;
  fastestPace?: number; // meters per second
  maxSpeed?: number;
  kudosReceived: number;
  prCount: number;
}

export interface YearStats {
  year: number;
  athlete: StravaAthlete;

  // Overall totals
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
  totalElevation: number;
  totalKudos: number;
  totalPRs: number;

  // Sports breakdown
  sportStats: SportStats[];
  primarySport: string;

  // Consistency
  daysActive: number;
  longestStreak: number;
  avgWeeklyActivities: number;
  mostActiveDay: string;
  mostActiveMonth: string;
  biggestWeek: { week: number; distance: number };
  biggestMonth: { month: string; distance: number };

  // Performance
  longestActivity: StravaActivity | null;
  biggestClimb: StravaActivity | null;
  fastestRun?: StravaActivity | null;
  fastestRide?: StravaActivity | null;

  // Location
  countries: string[];
  cities: string[];

  // Time preferences
  morningActivities: number;
  afternoonActivities: number;
  eveningActivities: number;
  preferredTime: string;

  // Insights
  insights: Insight[];
}

export interface Insight {
  type: 'time' | 'sport' | 'consistency' | 'location' | 'achievement' | 'social';
  icon: string;
  message: string;
  highlight?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  athlete: StravaAthlete | null;
}
