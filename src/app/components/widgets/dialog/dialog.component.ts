import {Component, Input, OnInit} from '@angular/core';
import {GroupContainer} from '../group-container/group-container.component';

export interface Dialog {
  header?: GroupContainer;
  tabs: GroupContainer[];
}

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  @Input()
  value: Dialog;

  constructor() { }

  ngOnInit() {
  }
}
