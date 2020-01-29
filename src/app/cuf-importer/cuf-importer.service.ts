import {HttpClient} from '@angular/common/http';
import {forkJoin, Observable, of} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';
import {parseXml} from '../xml-parser/parse-xml';
import {Injectable} from '@angular/core';
import {Dialogbaustein, Feldtyp, Gruppe, Gruppenimport} from './cuf-model';
import {Dialog} from '../components/widgets/dialog/dialog.component';
import {GroupContainer} from '../components/widgets/group-container/group-container.component';
import {Group} from '../components/widgets/group/group.component';
import {FieldType} from '../components/widgets/field/field.component';

@Injectable({providedIn: 'root'})
export class CufImporterService {
  constructor(private readonly http: HttpClient) {
  }

  createDialogModelFromCufFiles(dialogCufFileUrl: string,
                                widgetCufFileUrls: string[]): Observable<Dialog> {
    return this.createGroupRegistry(widgetCufFileUrls)
      .pipe(
        flatMap(groupRegistry => {
          return this.parseCufFileToJson(dialogCufFileUrl)
            .pipe(
              map(dialog => {
                const dialogModel: Dialog = {tabs: []};
                const tabs = dialog && dialog.KarteikarteList && asArray(dialog.KarteikarteList.Karteikarte);
                if (tabs) {
                  tabs.forEach((tab, index) => {
                    const groupContainer: GroupContainer = {
                      key: tab.Name ? tab.Name.toLowerCase() : '',
                      label: tab.Beschriftung,
                      groups: []
                    };
                    if (tab.GruppeList && tab.GruppeList.Gruppe) {
                      const groups = asArray(tab.GruppeList.Gruppe);
                      if (groups) {
                        groups.forEach(group => {
                          const newGroup: Group = {
                            fieldGroup: {
                              fields: []
                            }
                          };

                          const isFieldGroup = !!(group.Gruppentyp && group.Gruppentyp.Feldgruppe);
                          const isFieldGroupImport = !!(group.Gruppentyp && group.Gruppentyp.Feldgruppenimport);
                          const isTableGroup = !!(group.Gruppentyp && group.Gruppentyp.Tabellengruppe);
                          const isTableGroupImport = !!(group.Gruppentyp && group.Gruppentyp.Tabellengruppenimport);

                          if (isFieldGroup) {
                            groupContainer.groups.push(mapFieldGroup(group));
                          } else if (isFieldGroupImport) {
                            const groupToImport = group.Gruppentyp && group.Gruppentyp.Feldgruppenimport;
                            const importedGroup = importGroupFromRegistry(groupToImport, groupRegistry);
                            if (importedGroup) {
                              groupContainer.groups.push(mapFieldGroup(group, importedGroup));
                            }
                          } else if (isTableGroup) {
                            groupContainer.groups.push(mapTableGroup(group));
                          } else if (isTableGroupImport) {
                            const groupToImport = group.Gruppentyp && group.Gruppentyp.Tabellengruppenimport;
                            const importedGroup = importGroupFromRegistry(groupToImport, groupRegistry);
                            if (importedGroup) {
                              groupContainer.groups.push(mapTableGroup(group, importedGroup));
                            }
                          }
                        });
                      }
                    }
                    const firstTabShouldBeHeader = dialog && dialog.Kopfkarte;
                    firstTabShouldBeHeader && index === 0 ? dialogModel.header = groupContainer : dialogModel.tabs.push(groupContainer);
                  });
                }
                return dialogModel;
              })
            );
        })
      );
  }

  private createGroupRegistry(widgetCufFileUrls: string[]): Observable<GroupRegistry> {
    if (widgetCufFileUrls && widgetCufFileUrls.length) {
      return forkJoin(widgetCufFileUrls.map(url => this.parseCufFileToJson(url)))
        .pipe(createGroupRegistry());
    }
    return of({});
  }

  private parseCufFileToJson(fileUrl: string): Observable<Dialogbaustein> {
    return this.http.get(fileUrl, {responseType: 'text'})
      .pipe(map(cuf => parseXml(cuf) as Dialogbaustein));
  }
}

function asArray<T>(objectOrArray: T | T[]): T[] {
  return Array.isArray(objectOrArray) ? objectOrArray : (objectOrArray ? [objectOrArray] : []);
}

function importGroupFromRegistry(groupToImport: Gruppenimport, groupRegistry: GroupRegistry) {
  const idOfGroupToImport = groupToImport && groupToImport.Gruppe && groupToImport.Gruppe['@ID'];
  if (idOfGroupToImport) {
    return groupRegistry[idOfGroupToImport];
  }
}

function mapFieldType(fieldType: Feldtyp): FieldType {
  const mapping: { [key: string]: FieldType } = {
    TextfeldEinzeilig: 'TextField',
    TextfeldMehrzeilig: 'TextAreaField',
    Checkbox: 'CheckboxField',
    Combobox: 'Combobox'
  };
  if (fieldType) {
    const fieldTypesToMap = Object.keys(fieldType);
    if (fieldTypesToMap && fieldTypesToMap.length) {
      return mapping[fieldTypesToMap[0]];
    }
  }
}

function mapFieldGroup(originalGroup: Gruppe, importedGroup?: Gruppe): Group {
  if (originalGroup) {
    const noOfColumns = getNoOfColumns();
    const fields = getFields();

    return {
      label: originalGroup.Beschriftung || (importedGroup && importedGroup.Beschriftung),
      breakLine: !!(originalGroup.Umbruch && originalGroup.Umbruch === 'true'),
      fieldGroup: {
        fields: fields.map(field => ({
          label: field.Beschriftung,
          tooltip: field.LabelTooltip,
          type: mapFieldType(field.Feldtyp),
          id: field.Name
        })),
        columns: noOfColumns || null
      }
    };
  }

  function getFields() {
    const groupToTakeFieldsFrom = importedGroup || originalGroup;
    return groupToTakeFieldsFrom && groupToTakeFieldsFrom.Gruppentyp && groupToTakeFieldsFrom.Gruppentyp.Feldgruppe
      && groupToTakeFieldsFrom.Gruppentyp.Feldgruppe.FeldList
      && asArray(groupToTakeFieldsFrom.Gruppentyp.Feldgruppe.FeldList.Feld);
  }

  function getNoOfColumns() {
    const groupToTakeNoOfColumnsFrom = importedGroup || originalGroup;
    return groupToTakeNoOfColumnsFrom && groupToTakeNoOfColumnsFrom.Gruppentyp && groupToTakeNoOfColumnsFrom.Gruppentyp.Feldgruppe
      && groupToTakeNoOfColumnsFrom.Gruppentyp.Feldgruppe.Spalten
      && parseInt(groupToTakeNoOfColumnsFrom.Gruppentyp.Feldgruppe.Spalten, 10);
  }
}

function mapTableGroup(originalGroup: Gruppe, importedGroup?: Gruppe): Group {
  if (originalGroup) {
    const tableColumns = getTableColumns();

    return {
      label: originalGroup.Beschriftung || (importedGroup && importedGroup.Beschriftung),
      breakLine: !!(originalGroup.Umbruch && originalGroup.Umbruch === 'true'),
      table: {
        columns: tableColumns.map(column => ({
          label: column.Beschriftung,
          field: column.Name
        }))
      }
    };
  }

  function getTableColumns() {
    const groupToTakeTableColumnsFrom = importedGroup || originalGroup;
    return groupToTakeTableColumnsFrom && groupToTakeTableColumnsFrom.Gruppentyp && groupToTakeTableColumnsFrom.Gruppentyp.Tabellengruppe
      && groupToTakeTableColumnsFrom.Gruppentyp.Tabellengruppe.TabellenspalteList
      && asArray(groupToTakeTableColumnsFrom.Gruppentyp.Tabellengruppe.TabellenspalteList.Tabellenspalte);
  }
}

// tslint:disable-next-line:interface-over-type-literal
type GroupRegistry = { [groupId: string]: Gruppe };

function createGroupRegistry() {
  return map<Dialogbaustein[], GroupRegistry>((dialogs: Dialogbaustein[]) => {
    const groupRegistry = {};
    addDialogGroupsToRegistry(dialogs, groupRegistry);
    return groupRegistry;
  });

  function addDialogGroupsToRegistry(dialogs: Dialogbaustein[], groupRegistry: GroupRegistry) {
    if (dialogs) {
      dialogs.forEach(dialog => {
        const tabs = dialog && dialog.KarteikarteList && asArray(dialog.KarteikarteList.Karteikarte);
        if (tabs) {
          tabs.forEach(tab => {
            const groupList = tab.GruppeList;
            if (groupList) {
              const groups = asArray(groupList.Gruppe);
              if (groups) {
                groups.forEach(currentGroup => {
                  if (currentGroup && currentGroup.Gruppentyp
                    && (currentGroup.Gruppentyp.Feldgruppe || currentGroup.Gruppentyp.Tabellengruppe)) {
                    groupRegistry[currentGroup['@ID']] = currentGroup;
                  }
                });
              }
            }
          });
        }
      });
    }
  }
}
