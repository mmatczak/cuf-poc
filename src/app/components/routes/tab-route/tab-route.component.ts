import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {combineLatest, Observable, throwError} from 'rxjs';
import {GroupContainer} from '../../widgets/group-container/group-container.component';
import {map, pluck, tap} from 'rxjs/operators';

@Component({
  selector: 'app-tab-route',
  templateUrl: './tab-route.component.html',
  styleUrls: ['./tab-route.component.scss']
})
export class TabRouteComponent {
  tabGroupContainer$: Observable<GroupContainer>;

  constructor(private readonly route: ActivatedRoute) {
    this.tabGroupContainer$ = combineLatest(
      route.parent.data.pipe(pluck('dialog', 'tabs')),
      route.url
    ).pipe(
      map(([tabs, urlSegments]) => {
        const currentTabUrl = urlSegments && urlSegments.length && urlSegments[0] && urlSegments[0].path;
        let currentTab;
        if (tabs) {
          currentTab = tabs.find(tab => tab.key === currentTabUrl);
        }
        return currentTab || throwError('No tab found');
      }),
      tap(newTab => console.log(newTab))
    );
  }
}
