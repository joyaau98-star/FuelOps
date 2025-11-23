export interface VehicleSession {
  id?: string;
  vehicleId: string;
  date: number;           // Date.now()
  driverName: string;
  startOdometer: number;
  startFuelPct: number;   // 0–100
  endOdometer?: number;
  endFuelPct?: number;    // 0–100
  usedJerry?: boolean;    // si bajó del umbral y se cargó 20L
  lowFuelAlert?: boolean; // true si < 30%
  createdAt: number;
  updatedAt: number;
}
