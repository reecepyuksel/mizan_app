import { Controller, Get, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { GetQiblaDirectionUseCase } from "../../application/use-cases/get-qibla-direction.use-case";
import { QiblaQueryDto } from "../dto/qibla-query.dto";

@Controller("qibla")
@ApiTags("Qibla")
export class QiblaController {
  public constructor(
    private readonly getQiblaDirectionUseCase: GetQiblaDirectionUseCase,
  ) {}

  @Get("direction")
  @ApiOperation({ summary: "Koordinata gore kibla azimut yonu" })
  @ApiOkResponse({ description: "Kible yonu (derece)" })
  public getDirection(@Query() query: QiblaQueryDto) {
    return this.getQiblaDirectionUseCase.execute({
      latitude: query.lat,
      longitude: query.lon,
    });
  }
}
