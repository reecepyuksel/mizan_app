import { Inject, Injectable } from "@nestjs/common";

import { QiblaDirection } from "../../domain/entities/qibla-direction.entity";
import {
  CalculateQiblaDirectionInput,
  QiblaCalculatorPort,
} from "../ports/services/qibla-calculator.port";
import { QIBLA_CALCULATOR } from "../ports/services/service.tokens";

@Injectable()
export class GetQiblaDirectionUseCase {
  public constructor(
    @Inject(QIBLA_CALCULATOR)
    private readonly qiblaCalculator: QiblaCalculatorPort,
  ) {}

  public execute(input: CalculateQiblaDirectionInput): QiblaDirection {
    return this.qiblaCalculator.calculateDirection(input);
  }
}
