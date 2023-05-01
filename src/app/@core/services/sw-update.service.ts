import { ApplicationRef, Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent, UnrecoverableStateEvent, VersionEvent } from '@angular/service-worker';
import { concat } from 'rxjs/internal/observable/concat';
import { interval } from 'rxjs/internal/observable/interval';
import { filter } from 'rxjs/internal/operators/filter';
import { first } from 'rxjs/internal/operators/first';

@Injectable({
  providedIn: 'root'
})
export class SwUpdateService {

  constructor(private appRef: ApplicationRef, private swUpdateService: SwUpdate) {
    if (!swUpdateService.isEnabled) {
      console.log('SwUpdateService', 'Service Worker is not enabled');
      return;
    }

    // this.handleUpdate();

    //Logic for polling every 2 hours
    const appIsStable$ = appRef.isStable.pipe(first(isStable => isStable === true));
    const everyTwoHours$ = interval(2 * 60 * 60 * 1000);
    const everyTwoHoursOnceAppIsStable$ = concat(appIsStable$, everyTwoHours$);

    everyTwoHoursOnceAppIsStable$.subscribe(async () => {
      try {
        const updateFound = await swUpdateService.checkForUpdate();
        console.log(updateFound ? 'Polling:A new version is available.' : 'Polling:Already on the latest version.');
        if (updateFound) {
          window.location.reload();
        }
      } catch (err) {
        console.error('Polling:Failed to check for updates:', err);
      }
    });
  }

  // private handleUpdate() {
  //   this.swUpdateService.versionUpdates
  //     .pipe(filter((event: VersionEvent): event is VersionReadyEvent => event.type === 'VERSION_READY'))
  //     .subscribe((event: VersionEvent) => {
  //       // if (promptUser(event)) {
  //       // Reload the page to update to the latest version.
  //       console.log('handleUpdate event', event);
  //       // document.location.reload();
  //       // }
  //     });

  //   this.swUpdateService.unrecoverable.subscribe(
  //     (event: UnrecoverableStateEvent) => {
  //       alert('Error reason : ' + event.reason);
  //     }
  //   );
  // }
}
