import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {pluck} from 'rxjs/operators';
import {combineLatest, Observable, Subscription} from 'rxjs';
import {Dialog} from '../../widgets/dialog/dialog.component';

@Component({
  selector: 'app-dialog-route',
  templateUrl: './dialog-route.component.html',
  styleUrls: ['./dialog-route.component.scss']
})
export class DialogRouteComponent implements OnDestroy {
  dialog$: Observable<Dialog>;
  private readonly subscription: Subscription;

  constructor(route: ActivatedRoute, router: Router) {
    this.dialog$ = route.data.pipe(
      pluck('dialog')
    );

    this.subscription = combineLatest(this.dialog$, route.url)
      .subscribe(([dialog]) => {
        if (route.children.length === 0) {
          const urlOfFirstTab = dialog && dialog.tabs && dialog.tabs.length && dialog.tabs[0] && dialog.tabs[0].key;
          if (urlOfFirstTab) {
            router.navigate([urlOfFirstTab],
              {relativeTo: route, replaceUrl: true});
          }
        }
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
