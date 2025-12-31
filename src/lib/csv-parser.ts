// CSV Parser for Strava Data Export
// Parses activities.csv and reactions.csv from Strava data export

import { StravaActivity } from "@/types";

interface CSVActivity {
  "Activity ID": string;
  "Activity Date": string;
  "Activity Name": string;
  "Activity Type": string;
  "Activity Description": string;
  "Elapsed Time": string;
  Distance: string;
  "Max Heart Rate": string;
  "Relative Effort": string;
  Commute: string;
  "Activity Private Note": string;
  "Activity Gear": string;
  Filename: string;
  "Athlete Weight": string;
  "Bike Weight": string;
  "Elapsed Time.1": string;
  "Moving Time": string;
  "Distance.1": string;
  "Max Speed": string;
  "Average Speed": string;
  "Elevation Gain": string;
  "Elevation Loss": string;
  "Elevation Low": string;
  "Elevation High": string;
  "Max Grade": string;
  "Average Grade": string;
  "Average Positive Grade": string;
  "Average Negative Grade": string;
  "Max Cadence": string;
  "Average Cadence": string;
  "Max Heart Rate.1": string;
  "Average Heart Rate": string;
  "Max Watts": string;
  "Average Watts": string;
  Calories: string;
  "Max Temperature": string;
  "Average Temperature": string;
  "Relative Effort.1": string;
  "Total Work": string;
  "Number of Runs": string;
  "Uphill Time": string;
  "Downhill Time": string;
  "Other Time": string;
  "Perceived Exertion": string;
  Type: string;
  "Start Time": string;
  "Weighted Average Power": string;
  "Power Count": string;
  "Prefer Perceived Exertion": string;
  "Perceived Relative Effort": string;
  "Total Weight Lifted": string;
  "From Upload": string;
  "Grade Adjusted Distance": string;
  "Weather Observation Time": string;
  "Weather Condition": string;
  "Weather Temperature": string;
  "Apparent Temperature": string;
  Dewpoint: string;
  Humidity: string;
  "Weather Pressure": string;
  "Wind Speed": string;
  "Wind Gust": string;
  "Wind Bearing": string;
  "Precipitation Intensity": string;
  "Sunrise Time": string;
  "Sunset Time": string;
  "Moon Phase": string;
  Bike: string;
  Gear: string;
  "Precipitation Probability": string;
  "Precipitation Type": string;
  "Cloud Cover": string;
  "Weather Visibility": string;
  "UV Index": string;
  "Weather Ozone": string;
  [key: string]: string;
}

interface CSVReaction {
  activity_id: string;
  kudos_count: string;
  comment_count: string;
  [key: string]: string;
}

export interface ParsedData {
  activities: StravaActivity[];
  reactions: Map<number, { kudos: number; comments: number }>;
  athleteName: string;
  year: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Required columns for activities.csv
const REQUIRED_ACTIVITY_COLUMNS = [
  "Activity ID",
  "Activity Date",
  "Activity Type",
  "Elapsed Time",
  "Distance",
];

// Required columns for reactions.csv
const REQUIRED_REACTION_COLUMNS = ["activity_id"];

// Validate activities CSV file
export function validateActivitiesCSV(csvText: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!csvText || csvText.trim().length === 0) {
    return { isValid: false, errors: ["File is empty"], warnings: [] };
  }

  const lines = csvText.trim().split("\n");
  if (lines.length < 2) {
    return {
      isValid: false,
      errors: ["File must have a header row and at least one data row"],
      warnings: [],
    };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Check required columns
  const missingColumns = REQUIRED_ACTIVITY_COLUMNS.filter(
    (col) => !headers.some((h) => h.toLowerCase() === col.toLowerCase())
  );

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(", ")}`);
  }

  // Check if it looks like a Strava export
  if (
    !headers.some(
      (h) =>
        h.toLowerCase().includes("activity") ||
        h.toLowerCase().includes("strava")
    )
  ) {
    warnings.push(
      "This doesn't look like a Strava activities export. Make sure you're uploading the correct file."
    );
  }

  // Count valid data rows
  let validRows = 0;
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length > 0 && values.some((v) => v.trim().length > 0)) {
      validRows++;
    }
  }

  if (validRows === 0) {
    errors.push("No activity data found in the file");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Validate reactions CSV file
export function validateReactionsCSV(csvText: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!csvText || csvText.trim().length === 0) {
    return { isValid: false, errors: ["File is empty"], warnings: [] };
  }

  const lines = csvText.trim().split("\n");
  if (lines.length < 1) {
    return {
      isValid: false,
      errors: ["File must have a header row"],
      warnings: [],
    };
  }

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Check required columns
  const hasActivityId = headers.some(
    (h) =>
      h.toLowerCase() === "activity_id" ||
      h.toLowerCase() === "activityid" ||
      h.toLowerCase() === "activity id"
  );

  if (!hasActivityId) {
    errors.push("Missing required column: activity_id");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Parse CSV string to array of objects
function parseCSV<T extends Record<string, string>>(csvText: string): T[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]);

  // Parse data rows
  const data: T[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      data.push(row as T);
    }
  }

  return data;
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Map Strava activity type to sport_type
function mapActivityType(activityType: string): string {
  const typeMap: Record<string, string> = {
    Run: "Run",
    Ride: "Ride",
    Swim: "Swim",
    Walk: "Walk",
    Hike: "Hike",
    "Virtual Ride": "VirtualRide",
    "Virtual Run": "VirtualRun",
    "Weight Training": "WeightTraining",
    Yoga: "Yoga",
    Workout: "Workout",
    Elliptical: "Elliptical",
    "Stair-Stepper": "StairStepper",
    "Rock Climbing": "RockClimbing",
    "Nordic Ski": "NordicSki",
    "Alpine Ski": "AlpineSki",
    Snowboard: "Snowboard",
    Kayaking: "Kayaking",
    Rowing: "Rowing",
    Canoeing: "Canoeing",
    "Stand Up Paddling": "StandUpPaddling",
    Surfing: "Surfing",
    Windsurf: "Windsurf",
    Kitesurf: "Kitesurf",
    Golf: "Golf",
    Tennis: "Tennis",
    Pickleball: "Pickleball",
    Soccer: "Soccer",
    Football: "Football",
    Basketball: "Basketball",
    "Ice Skate": "IceSkate",
    Skateboard: "Skateboard",
    "Roller Ski": "RollerSki",
    "Inline Skate": "InlineSkate",
    "E-Bike Ride": "EBikeRide",
    "E-Mountain Bike Ride": "EMountainBikeRide",
    Velomobile: "Velomobile",
    Handcycle: "Handcycle",
    Wheelchair: "Wheelchair",
  };

  return typeMap[activityType] || activityType;
}

// Parse time string (HH:MM:SS or seconds) to seconds
function parseElapsedTime(timeStr: string): number {
  if (!timeStr) return 0;

  // If it's just a number, assume it's already in seconds
  if (/^\d+(\.\d+)?$/.test(timeStr)) {
    return Math.round(parseFloat(timeStr));
  }

  // Parse HH:MM:SS format
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  return 0;
}

// Parse distance (could be in km or meters)
function parseDistance(distanceStr: string): number {
  if (!distanceStr) return 0;
  const value = parseFloat(distanceStr.replace(",", ""));
  if (isNaN(value)) return 0;
  // Strava export uses meters
  return value;
}

// Parse date string to ISO format
function parseDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString();

  // Try parsing various formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date.toISOString();
  }

  // Try DD MMM YYYY, HH:MM:SS format (e.g., "25 Dec 2024, 08:30:00")
  const match = dateStr.match(
    /(\d{1,2})\s+(\w+)\s+(\d{4}),?\s+(\d{1,2}):(\d{2}):(\d{2})/
  );
  if (match) {
    const [, day, monthStr, year, hour, min, sec] = match;
    const months: Record<string, number> = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };
    const month = months[monthStr] ?? 0;
    return new Date(
      parseInt(year),
      month,
      parseInt(day),
      parseInt(hour),
      parseInt(min),
      parseInt(sec)
    ).toISOString();
  }

  return new Date().toISOString();
}

// Convert CSV activity to StravaActivity type
function csvToStravaActivity(csvRow: CSVActivity): StravaActivity {
  const elapsedTime = parseElapsedTime(
    csvRow["Elapsed Time"] || csvRow["Elapsed Time.1"]
  );
  const movingTime = parseElapsedTime(csvRow["Moving Time"]) || elapsedTime;
  const distance = parseDistance(csvRow["Distance"] || csvRow["Distance.1"]);

  return {
    id: parseInt(csvRow["Activity ID"]) || Math.random() * 1000000,
    name: csvRow["Activity Name"] || "Untitled Activity",
    type: csvRow["Activity Type"] || "Workout",
    sport_type: mapActivityType(csvRow["Activity Type"]),
    start_date: parseDate(csvRow["Activity Date"]),
    start_date_local: parseDate(csvRow["Activity Date"]),
    distance: distance,
    moving_time: movingTime,
    elapsed_time: elapsedTime,
    total_elevation_gain: parseFloat(csvRow["Elevation Gain"]) || 0,
    average_speed:
      parseFloat(csvRow["Average Speed"]) || distance / movingTime || 0,
    max_speed: parseFloat(csvRow["Max Speed"]) || 0,
    average_heartrate: parseFloat(csvRow["Average Heart Rate"]) || undefined,
    max_heartrate:
      parseFloat(csvRow["Max Heart Rate"] || csvRow["Max Heart Rate.1"]) ||
      undefined,
    kudos_count: 0, // Will be filled from reactions.csv
    comment_count: 0, // Will be filled from reactions.csv
    athlete_count: 1,
    photo_count: 0,
    start_latlng: null,
    end_latlng: null,
    location_city: null,
    location_state: null,
    location_country: null,
    timezone: "",
    achievement_count: 0,
    pr_count: 0,
  };
}

// Parse reactions.csv (kudos and comments)
export function parseReactionsCSV(
  csvText: string
): Map<number, { kudos: number; comments: number }> {
  const reactions = new Map<number, { kudos: number; comments: number }>();

  const data = parseCSV<CSVReaction>(csvText);

  for (const row of data) {
    const activityId = parseInt(row["activity_id"]);
    if (!isNaN(activityId)) {
      reactions.set(activityId, {
        kudos: parseInt(row["kudos_count"]) || 0,
        comments: parseInt(row["comment_count"]) || 0,
      });
    }
  }

  return reactions;
}

// Main parser function
export function parseStravaExport(
  activitiesCSV: string,
  reactionsCSV?: string,
  year?: number
): ParsedData {
  const targetYear = year || new Date().getFullYear();

  // Parse activities
  const csvData = parseCSV<CSVActivity>(activitiesCSV);

  // Parse reactions if provided
  const reactions = reactionsCSV ? parseReactionsCSV(reactionsCSV) : new Map();

  // Convert to StravaActivity and filter by year
  const activities: StravaActivity[] = [];

  for (const row of csvData) {
    const activity = csvToStravaActivity(row);
    const activityYear = new Date(activity.start_date).getFullYear();

    if (activityYear === targetYear) {
      // Add kudos/comments from reactions
      const reaction = reactions.get(activity.id);
      if (reaction) {
        activity.kudos_count = reaction.kudos;
        activity.comment_count = reaction.comments;
      }

      activities.push(activity);
    }
  }

  return {
    activities,
    reactions,
    athleteName: "Athlete", // CSV doesn't include athlete name
    year: targetYear,
  };
}

// Get available years from activities CSV
export function getAvailableYears(activitiesCSV: string): number[] {
  const csvData = parseCSV<CSVActivity>(activitiesCSV);
  const years = new Set<number>();

  for (const row of csvData) {
    const date = parseDate(row["Activity Date"]);
    const year = new Date(date).getFullYear();
    if (!isNaN(year) && year > 2000 && year <= new Date().getFullYear()) {
      years.add(year);
    }
  }

  return Array.from(years).sort((a, b) => b - a);
}
