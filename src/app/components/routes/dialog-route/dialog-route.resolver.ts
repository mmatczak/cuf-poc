import {ActivatedRouteSnapshot, Resolve} from '@angular/router';
import {Dialog} from '../../widgets/dialog/dialog.component';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {CufImporterService} from '../../../cuf-importer/cuf-importer.service';

const widgetCufFileUrls = [
  'assets/common-widgets/DB_ZVK_01_381F_VRF.xml',
  'assets/common-widgets/DB_ZVK_01_385F_VRF.xml',
  'assets/common-widgets/DB_ZVK_03_010_01_daten_krankenversicherung_versicherter_mit_suche.xml',
  'assets/common-widgets/DB_ZVK_03_029_daten_versorgungsfall_rente_ar_em_grund_VRF.xml',
  'assets/common-widgets/DB_ZVK_03_029_daten_versorgungsfall_rente_ar_em_VRF.xml',
  'assets/common-widgets/DB_ZVK_03_029F_Vertragsanspruchsfaelle.xml',
  'assets/common-widgets/DB_ZVK_03_053_daten_ruhenstatbestaende_ar_VRF.xml',
  'assets/common-widgets/DB_ZVK_06_001_01_eva.xml',
  'assets/common-widgets/DB_ZVK_XX_381F_VRF.xml',
  'assets/common-widgets/DBS_ZMV_00_001F_DSVZ.xml',
  'assets/common-widgets/KK_Versicherter.xml'
];

@Injectable({providedIn: 'root'})
export class DialogRouteResolver implements Resolve<Dialog> {

  constructor(private readonly cufImporter: CufImporterService) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<Dialog> {
    const dialogId = route.url && route.url.length && route.url[0] && route.url[0].path;
    if (dialogId) {
      return this.cufImporter.createDialogModelFromCufFiles(`assets/${dialogId}/${dialogId}.xml`, widgetCufFileUrls);
    }
  }
}
