import {Component, Input} from '@angular/core';
import {FieldGroup} from '../field-group/field-group.component';

export interface Group {
  label?: string;
  breakLine?: boolean;
  fieldGroup: FieldGroup;
}

@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.scss']
})
export class GroupComponent {
  private _value: Group;

  @Input()
  set value(newValue: Group) {
    this._value = newValue;
  }

  get value(): Group {
    return this._value;
  }

  constructor() {
  }
}
