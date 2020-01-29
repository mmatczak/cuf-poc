import {Component, Input} from '@angular/core';
import {Field} from '../field/field.component';

export interface FieldGroup {
  fields: Field[];
  columns?: number;
}

@Component({
  selector: 'app-field-group',
  templateUrl: './field-group.component.html',
  styleUrls: ['./field-group.component.scss']
})
export class FieldGroupComponent {
  formRows: Field[][];

  @Input()
  set value(newFieldGroup: FieldGroup) {
    if (newFieldGroup) {
      const noOfFieldsInRow = newFieldGroup.columns ? Math.floor(newFieldGroup.columns / 2) : 3;
      this.formRows = [];
      if (newFieldGroup.fields) {
        for (let startIndex = 0; startIndex < newFieldGroup.fields.length; startIndex += noOfFieldsInRow) {
          this.formRows.push(newFieldGroup.fields.slice(startIndex, startIndex + noOfFieldsInRow));
        }
      }
    }
  }

  constructor() { }
}
