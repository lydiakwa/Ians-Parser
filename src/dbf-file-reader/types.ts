// C=string, N=numeric, F=float, Y=currency, L=logical, D=date, I=integer, M=memo, T=datetime, B=double
export type FieldType =
  | 'C'
  | 'N'
  | 'F'
  | 'Y'
  | 'L'
  | 'D'
  | 'I'
  | 'M'
  | 'T'
  | 'B';
export type RecordValue = Date | string | number | boolean | null;

export interface Field {
  name: string;
  type: FieldType;
  size: number;
  decimalPlaces?: number;
}

// export const FIELD_DELETED = Symbol();
export const FIELD_DELETED = 'Record Deleted';

export type RecordType = Record<string, RecordValue> & {
  [FIELD_DELETED]?: boolean;
};

export interface FileVersion {
  code: number;
  name: string;
}

export interface DBFFile {
  fileVersion: FileVersion;
  lastUpdateDate: Date;
  recordCount: number;
  headerLength: number;
  recordLength: number;
  memoBlockSize: number;
  hasStructuralCDXFile?: boolean;
  hasMemoField?: boolean;
  isDBCDatabase?: boolean;
  fields: Field[];
  records: RecordType[];
}
