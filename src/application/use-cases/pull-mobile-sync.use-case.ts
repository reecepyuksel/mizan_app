import { Inject, Injectable } from "@nestjs/common";

import {
  MobileSyncPort,
  PullSyncInput,
} from "../ports/services/mobile-sync.port";
import { MOBILE_SYNC_SERVICE } from "../ports/services/service.tokens";

@Injectable()
export class PullMobileSyncUseCase {
  public constructor(
    @Inject(MOBILE_SYNC_SERVICE)
    private readonly mobileSyncService: MobileSyncPort,
  ) {}

  public execute(input: PullSyncInput) {
    return this.mobileSyncService.pull(input);
  }
}
