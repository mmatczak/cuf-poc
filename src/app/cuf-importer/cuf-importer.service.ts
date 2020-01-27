import {HttpClient} from '@angular/common/http';
import {forkJoin, Observable, of} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';
import {parseXml} from '../xml-parser/parse-xml';
import {Injectable} from '@angular/core';
import {Dialogbaustein, Feldtyp, Gruppe} from './cuf-model';
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
                            const fields = group.Gruppentyp.Feldgruppe && group.Gruppentyp.Feldgruppe.FeldList
                              && asArray(group.Gruppentyp.Feldgruppe.FeldList.Feld);
                            groupContainer.groups.push({
                              label: group.Beschriftung,
                              breakLine: !!(group.Umbruch && group.Umbruch === 'true'),
                              fieldGroup: {
                                fields: fields.map(field => ({
                                  label: field.Beschriftung,
                                  tooltip: field.LabelTooltip,
                                  type: mapFieldType(field.Feldtyp),
                                  id: field.Name
                                }))
                              }
                            });
                          } else if (isFieldGroupImport) {
                            const groupId = group.Gruppentyp && group.Gruppentyp.Feldgruppenimport
                              && group.Gruppentyp.Feldgruppenimport.Gruppe && group.Gruppentyp.Feldgruppenimport.Gruppe['@ID'];
                            if (groupId) {
                              const importedGroup = groupRegistry[groupId];
                              if (importedGroup) {
                                const fields = importedGroup.Gruppentyp.Feldgruppe && importedGroup.Gruppentyp.Feldgruppe.FeldList
                                  && asArray(importedGroup.Gruppentyp.Feldgruppe.FeldList.Feld);
                                groupContainer.groups.push({
                                  label: group.Beschriftung || importedGroup.Beschriftung,
                                  breakLine: !!(group.Umbruch && group.Umbruch === 'true'),
                                  fieldGroup: {
                                    fields: fields.map(field => ({
                                      label: field.Beschriftung,
                                      tooltip: field.LabelTooltip,
                                      type: mapFieldType(field.Feldtyp),
                                      id: field.Name
                                    }))
                                  }
                                });
                              }
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

function mapFieldType(fieldType: Feldtyp): FieldType {
  const mapping: {[key: string]: FieldType} = {
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
