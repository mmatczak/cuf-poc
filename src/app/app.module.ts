import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {HttpClientModule} from '@angular/common/http';
import {GroupComponent} from './components/widgets/group/group.component';
import {FieldGroupComponent} from './components/widgets/field-group/field-group.component';
import {FieldComponent} from './components/widgets/field/field.component';
import {DialogComponent} from './components/widgets/dialog/dialog.component';
import {GroupContainerComponent} from './components/widgets/group-container/group-container.component';
import {RouterModule} from '@angular/router';
import {DialogRouteComponent} from './components/routes/dialog-route/dialog-route.component';
import {TabRouteComponent} from './components/routes/tab-route/tab-route.component';
import {HomeRouteComponent} from './components/routes/home-route/home-route.component';
import {DialogRouteResolver} from './components/routes/dialog-route/dialog-route.resolver';

@NgModule({
  declarations: [
    AppComponent,
    GroupComponent,
    FieldGroupComponent,
    FieldComponent,
    DialogComponent,
    GroupContainerComponent,
    DialogRouteComponent,
    TabRouteComponent,
    HomeRouteComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([
      {path: '', redirectTo: '/', pathMatch: 'full'},
      {
        path: '',
        component: HomeRouteComponent
      },
      {
        path: ':dialogKey',
        component: DialogRouteComponent,
        resolve: {
          dialog: DialogRouteResolver
        },
        children: [{
          path: ':tabKey',
          component: TabRouteComponent
        }]
      }
    ])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
