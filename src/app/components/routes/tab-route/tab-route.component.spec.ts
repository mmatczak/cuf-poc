import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TabRouteComponent } from './tab-route.component';

describe('TabRouteComponent', () => {
  let component: TabRouteComponent;
  let fixture: ComponentFixture<TabRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TabRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TabRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
