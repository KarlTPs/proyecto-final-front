import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'averageRating',
})
export class AverageRatingPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
