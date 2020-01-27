import {Component, Input} from '@angular/core';

export type FieldType = 'TextField' | 'CheckboxField' | 'TextAreaField' | 'Combobox';

export interface Field {
  label?: string;
  tooltip?: string;
  type: FieldType;
  id: string;
}

@Component({
  selector: 'app-field',
  templateUrl: './field.component.html',
  styleUrls: ['./field.component.scss']
})
export class FieldComponent {
  private _value: Field;

  get value(): Field {
    return this._value;
  }

  @Input()
  set value(value: Field) {
    this._value = value;
  }

  constructor() { }
}
