import { Injectable } from "@nestjs/common";

import {
  CalculateQiblaDirectionInput,
  QiblaCalculatorPort,
} from "../../application/ports/services/qibla-calculator.port";
import { QiblaDirection } from "../../domain/entities/qibla-direction.entity";

const KAABA_LATITUDE = 21.422487;
const KAABA_LONGITUDE = 39.826206;

@Injectable()
export class SphericalQiblaCalculatorService implements QiblaCalculatorPort {
  public calculateDirection(
    input: CalculateQiblaDirectionInput,
  ): QiblaDirection {
    const userLatRad = this.toRadians(input.latitude);
    const kaabaLatRad = this.toRadians(KAABA_LATITUDE);
    const deltaLonRad = this.toRadians(KAABA_LONGITUDE - input.longitude);

    const y = Math.sin(deltaLonRad);
    const x =
      Math.cos(userLatRad) * Math.tan(kaabaLatRad) -
      Math.sin(userLatRad) * Math.cos(deltaLonRad);

    const bearing = this.toDegrees(Math.atan2(y, x));
    const normalizedBearing = (bearing + 360) % 360;

    return {
      latitude: input.latitude,
      longitude: input.longitude,
      kaabaLatitude: KAABA_LATITUDE,
      kaabaLongitude: KAABA_LONGITUDE,
      qiblaAzimuth: Number(normalizedBearing.toFixed(4)),
    };
  }

  private toRadians(value: number): number {
    return (value * Math.PI) / 180;
  }

  private toDegrees(value: number): number {
    return (value * 180) / Math.PI;
  }
}
