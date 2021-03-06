export interface Gruppe {
  '@ID': string;
  Name: string;
  Beschriftung: string;
  Gruppentyp: Gruppentyp;
  Umbruch?: string;
}

export interface Gruppentyp {
  Feldgruppe?: Feldgruppe;
  Feldgruppenimport?: Gruppenimport;
  Tabellengruppe?: Tabellengruppe;
  Tabellengruppenimport?: Gruppenimport;
}

export interface Gruppenimport {
  Gruppe: { '@ID': string };
}

export interface Feldgruppe {
  FeldList: {
    Feld: Feld | Feld[];
  };
  Spalten?: string;
}

export interface Tabellengruppe {
  TabellenspalteList: {
    Tabellenspalte: Tabellenspalte | Tabellenspalte[];
  };
}

export interface Feld {
  Name: string;
  Beschriftung: string;
  LabelTooltip?: string;
  Feldtyp: Feldtyp;
}

export interface Tabellenspalte {
  Name: string;
  Beschriftung: string;
}

export interface Feldtyp {
  TextfeldMehrzeilig?: any;
  TextfeldEinzeilig?: any;
  Checkbox?: any;
  Combobox?: any;
}

export interface GruppeList {
  Gruppe: Gruppe | Gruppe[];
}

export interface Karteikarte {
  Name: string;
  Beschriftung: string;
  GruppeList: GruppeList;
}

export interface KarteikarteList {
  Karteikarte: Karteikarte | Karteikarte[];
}

export interface Dialogbaustein {
  Kopfkarte: boolean;
  KarteikarteList: KarteikarteList;
}
