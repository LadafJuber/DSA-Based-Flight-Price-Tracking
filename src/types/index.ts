// ─── ENUMS ──────────────────────────────────────────────────────────────────
// These mirror Prisma enums — defining them here lets us use them
// in both frontend components and API routes without importing from Prisma

export type FlightStatus =
  | "SCHEDULED"
  | "BOARDING"
  | "DEPARTED"
  | "IN_AIR"
  | "LANDED"
  | "DELAYED"
  | "CANCELLED"
  | "DIVERTED";

export type NotificationType =
  | "STATUS_CHANGE"
  | "PRICE_DROP"
  | "GATE_CHANGE"
  | "DELAY_UPDATE";

// ─── AIRPORT ────────────────────────────────────────────────────────────────
// Represents a physical airport
// IATA code = the 3-letter code you see on boarding passes (BOM, DEL, BLR)

export type Airport = {
  id: string;
  iataCode: string;       // "BOM", "DEL", "BLR" — always 3 uppercase letters
  name: string;           // "Chhatrapati Shivaji Maharaj International Airport"
  city: string;           // "Mumbai"
  country: string;        // "India"
  timezone: string;       // "Asia/Kolkata" — IANA timezone string, not "+05:30"
};

// ─── AIRLINE ────────────────────────────────────────────────────────────────
// Represents an airline company

export type Airline = {
  id: string;
  iataCode: string;       // "6E" = IndiGo, "AI" = Air India, "UK" = Vistara
  name: string;           // "IndiGo"
  logoUrl: string | null; // nullable — we might not have every airline's logo
};

// ─── FLIGHT ─────────────────────────────────────────────────────────────────
// A scheduled flight on a specific date
// Note: "6E-205 on 2024-01-15" is a different entity than "6E-205 on 2024-01-16"
// Each date is a separate Flight record

export type Flight = {
  id: string;
  flightNumber: string;   // "6E-205" — airline code + number
  airlineId: string;
  originId: string;       // FK to Airport
  destinationId: string;  // FK to Airport
  scheduledDeparture: Date;
  scheduledArrival: Date;
  terminal: string | null;
  gate: string | null;
  aircraft: string | null; // "Airbus A320" — nice to show but not critical
};

// ─── FLIGHT WITH RELATIONS ──────────────────────────────────────────────────
// This is what the API returns — Flight + its related records joined
// This pattern (Type + TypeWithRelations) is how seniors type Prisma results

export type FlightWithRelations = Flight & {
  airline: Airline;
  origin: Airport;
  destination: Airport;
  currentStatus: FlightStatusRecord | null;
};

// ─── FLIGHT STATUS RECORD ───────────────────────────────────────────────────
// One row in the status history log
// Why a separate table? Because we want to show "was delayed at 14:00,
// then departed at 15:30" — that requires history, not just the current state

export type FlightStatusRecord = {
  id: string;
  flightId: string;
  status: FlightStatus;
  recordedAt: Date;
  delayMinutes: number | null;  // how many minutes delayed, if DELAYED
  reason: string | null;        // "Weather conditions", "Crew unavailability"
  actualDeparture: Date | null;
  actualArrival: Date | null;
};

// ─── TRACKED FLIGHT ─────────────────────────────────────────────────────────
// The join table between User and Flight (user's watchlist)
// Why a separate table? Because in the future we might add per-user
// settings like "notify me only if delay > 30 minutes"

export type TrackedFlight = {
  id: string;
  userId: string;
  flightId: string;
  trackedAt: Date;
  notifyOnStatusChange: boolean;
  notifyOnPriceDrop: boolean;
  priceAlertThreshold: number | null; // notify when price drops below this
};

// ─── PRICE SNAPSHOT ─────────────────────────────────────────────────────────
// One price observation at a point in time
// Why store history? For the price chart feature — we plot price over time

export type PriceSnapshot = {
  id: string;
  flightId: string;
  price: number;          // in INR paisa (integer, not float — never use float for money)
  currency: string;       // "INR"
  recordedAt: Date;
  source: string;         // "makemytrip", "goibibo" — where we got this price
};

// ─── API RESPONSE WRAPPERS ──────────────────────────────────────────────────
// Standard API response shape — every API route returns one of these
// This means frontend code always knows: check .success, then .data or .error

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
  code?: string;  // "NOT_FOUND", "UNAUTHORIZED", "VALIDATION_ERROR"
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;