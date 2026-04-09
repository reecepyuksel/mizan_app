import { QiblaDirection } from "../../../domain/entities/qibla-direction.entity";

export interface CalculateQiblaDirectionInput {
  latitude: number;
  longitude: number;
}

export interface QiblaCalculatorPort {
  calculateDirection(input: CalculateQiblaDirectionInput): QiblaDirection;
}
