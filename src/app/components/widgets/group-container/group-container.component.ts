import {Component, Input, OnInit} from '@angular/core';
import {Group} from '../group/group.component';

export interface GroupContainer {
  key?: string;
  label?: string;
  groups: Group[];
}

@Component({
  selector: 'app-group-container',
  templateUrl: './group-container.component.html',
  styleUrls: ['./group-container.component.scss']
})
export class GroupContainerComponent implements OnInit {
  groups: Group[];
  rowLayout = true;
  groupLayoutSections: Group[][];

  @Input()
  set value(newValue: GroupContainer) {
    const newGroups = newValue && newValue.groups;
    if (newGroups && newGroups.length) {
      this.groupLayoutSections = [];
      let currentLayoutSection = [];
      newValue.groups.forEach(group => {
        currentLayoutSection.push(group);
        if (group.breakLine) {
          this.groupLayoutSections.push(currentLayoutSection);
          currentLayoutSection = [];
        }
      });

      if (newGroups.length === this.groupLayoutSections.length) { // flex column layout
        this.rowLayout = false;
        this.groups = newGroups;
      } else if (this.groupLayoutSections.length === 1) { // flex row layout
        this.rowLayout = true;
        this.groups = newGroups;
      } else { // mix
        // TODO
      }
    } else {
      this.groups = [];
    }
  }

  constructor() {
  }

  ngOnInit() {
  }

}
