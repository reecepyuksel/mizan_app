import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";

import { PullMobileSyncUseCase } from "../../application/use-cases/pull-mobile-sync.use-case";
import { PushMobileSyncUseCase } from "../../application/use-cases/push-mobile-sync.use-case";
import { PullSyncQueryDto } from "../dto/pull-sync-query.dto";
import { PushSyncDto } from "../dto/push-sync.dto";

@Controller("sync")
@ApiTags("Sync")
export class SyncController {
  public constructor(
    private readonly pullMobileSyncUseCase: PullMobileSyncUseCase,
    private readonly pushMobileSyncUseCase: PushMobileSyncUseCase,
  ) {}

  @Get("pull")
  @ApiOperation({ summary: "WatermelonDB pull senkronizasyonu" })
  @ApiOkResponse({ description: "Degisen kayitlar ve server timestamp" })
  public pull(@Query() query: PullSyncQueryDto) {
    return this.pullMobileSyncUseCase.execute({
      deviceId: query.deviceId,
      lastPulledAt: query.lastPulledAt,
    });
  }

  @Post("push")
  @ApiOperation({ summary: "WatermelonDB push senkronizasyonu" })
  @ApiOkResponse({ description: "Push basari durumu" })
  public push(@Body() body: PushSyncDto) {
    return this.pushMobileSyncUseCase.execute({
      deviceId: body.deviceId,
      changes: body.changes,
    });
  }
}
