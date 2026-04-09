import { Inject, Injectable } from "@nestjs/common";

import {
  MobileSyncPort,
  PushSyncInput,
} from "../ports/services/mobile-sync.port";
import { MOBILE_SYNC_SERVICE } from "../ports/services/service.tokens";

@Injectable()
export class PushMobileSyncUseCase {
  public constructor(
    @Inject(MOBILE_SYNC_SERVICE)
    private readonly mobileSyncService: MobileSyncPort,
  ) {}

  public execute(input: PushSyncInput) {
    return this.mobileSyncService.push(input);
  }
}
