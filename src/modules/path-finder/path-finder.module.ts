import { Module } from '@nestjs/common';
import { PathFinderService } from './path-finder.service';

@Module({
  controllers: [],
  providers: [PathFinderService],
})
export class PathFinderModule {}
