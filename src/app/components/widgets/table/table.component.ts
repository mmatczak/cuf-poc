import {Component, Input, OnInit} from '@angular/core';
import { GridApi, GridReadyEvent, ColumnApi, ColDef} from 'ag-grid-community';

export interface Table {
  columns: TableColumn[];
}

export interface TableColumn {
  label: string;
  field: string;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input()
  set value(newTable: Table) {
    if (newTable) {
      this.columnDefs = newTable.columns.map(column => ({
        headerName: column.label,
        field: column.field,
        sortable: true,
        filter: true,
        editable: true
      }));
    }
  }

  columnDefs: ColDef[] = [];

  rowData = [];

  private gridApi: GridApi;
  private gridColumnApi: ColumnApi;

  constructor() {
  }

  ngOnInit() {
  }

  addNew() {
    const firstColumn = this.columnDefs && this.columnDefs.length && this.columnDefs[0];
    if (firstColumn) {
      const newRow = {};
      newRow[firstColumn.field] = firstColumn.headerName;
      this.rowData = [...this.rowData, newRow];
      setTimeout(() => {
        this.gridApi.setFocusedCell(this.rowData.length - 1, firstColumn.field);
        this.gridApi.startEditingCell({
          rowIndex: this.rowData.length - 1,
          colKey: firstColumn.field
        });
      });
    }
  }

  onGridReady($event: GridReadyEvent) {
    this.gridApi = $event.api;
    this.gridColumnApi = $event.columnApi;
  }
}
