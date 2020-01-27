import {Component, Input} from '@angular/core';
import {Field} from '../field/field.component';

export interface FieldGroup {
  fields: Field[];
}

@Component({
  selector: 'app-field-group',
  templateUrl: './field-group.component.html',
  styleUrls: ['./field-group.component.scss']
})
export class FieldGroupComponent {
  private _value: FieldGroup;

  get value(): FieldGroup {
    return this._value;
  }

  @Input()
  set value(value: FieldGroup) {
    this._value = value;
  }

  constructor() { }
}
