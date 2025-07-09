import FieldReader from './field-reader';
import FILE_VERSION, { fileVersionForCode } from './file-version-identifiers';
import {
  FIELD_DELETED,
  type DBFFile,
  type FieldType,
  type RecordType,
} from './types';
import { substr } from './utils';

export class DBFFileReader {
  dbfFileBuffer: ArrayBuffer;
  memoFile?: ArrayBuffer;

  constructor(dbfFileBuffer: ArrayBuffer, memoFile?: ArrayBuffer) {
    this.dbfFileBuffer = dbfFileBuffer;
    this.memoFile = memoFile;
  }

  async read(): Promise<DBFFile> {
    const dbfFile = {} as DBFFile;

    this.setDBFFileMetadata(dbfFile);
    this.setDBFFileFields(dbfFile);
    this.setDBFFileMemoMetadata(dbfFile);
    this.setDBFFileRecords(dbfFile);

    return dbfFile;
  }

  private setDBFFileMetadata(dbfFile: DBFFile): void {
    const dataView = new DataView(this.dbfFileBuffer);

    // Byte offset 0: DBF File type
    dbfFile.fileVersion = fileVersionForCode(dataView.getUint8(0));

    // Byte offset 1-3: Last update (YYMMDD)
    const lastUpdateY = dataView.getUint8(1); // number of years after 1900
    const lastUpdateM = dataView.getUint8(2); // 1-based
    const lastUpdateD = dataView.getUint8(3); // 1-based

    dbfFile.lastUpdateDate = new Date(
      lastUpdateY + 1900,
      lastUpdateM - 1,
      lastUpdateD
    );

    // Byte offset 4-7: Number of records in file
    dbfFile.recordCount = dataView.getInt32(4, true);

    // Byte offset 8-9: Position of first data record
    dbfFile.headerLength = dataView.getInt16(8, true);

    // Byte offset 10-11: Length of one data record, including delete flag
    dbfFile.recordLength = dataView.getInt16(10, true);

    // Byte offset 12 - 27: Reserved

    // Byte offset 28: Table flags
    // 0x01 - file has a structural .cdx
    // 0x02 - file has a Memo field
    // 0x04 - file is a database (.dbc)
    // This byte can contain the sum of any of the above values. For example, the value 0x03 indicates the table has a structural .cdx and a Memo field.
    const tableFlags = dataView.getUint8(28);

    if (tableFlags === 0x01) {
      dbfFile.hasStructuralCDXFile = true;
    } else if (tableFlags === 0x02) {
      dbfFile.hasMemoField = true;
    } else if (tableFlags === 0x03) {
      dbfFile.hasStructuralCDXFile = true;
      dbfFile.hasMemoField = true;
    } else if (tableFlags === 0x04) {
      dbfFile.isDBCDatabase = true;
    } else if (tableFlags === 0x05) {
      dbfFile.hasStructuralCDXFile = true;
      dbfFile.isDBCDatabase = true;
    } else if (tableFlags === 0x06) {
      dbfFile.hasMemoField = true;
      dbfFile.isDBCDatabase = true;
    } else if (tableFlags === 0x07) {
      dbfFile.hasStructuralCDXFile = true;
      dbfFile.hasMemoField = true;
      dbfFile.isDBCDatabase = true;
    }

    // Byte offset 29: Code page mark
    // Byte offset 30-31: Reserved, contains 0x00
  }

  private setDBFFileMemoMetadata(dbfFile: DBFFile): void {
    if (this.memoFile) {
      console.log(this.memoFile);
      const memoDataView = new DataView(this.memoFile);
      if (
        dbfFile.fileVersion === FILE_VERSION.VisualFoxPro ||
        dbfFile.fileVersion === FILE_VERSION.FoxPro2WithMemo
      ) {
        dbfFile.memoBlockSize = memoDataView.getUint16(6) || 512;
      } else if (dbfFile.fileVersion === FILE_VERSION.dBASEIVWithMemo) {
        dbfFile.memoBlockSize = memoDataView.getInt32(4, true) || 0;
      } else {
        dbfFile.memoBlockSize = 512;
      }
    }
  }

  private setDBFFileFields(dbfFile: DBFFile): void {
    const dataView = new DataView(this.dbfFileBuffer);

    dbfFile.fields = [];

    // Byte offset 32 - n: Field subrecords
    // The number of fields determines the number of field subrecords.
    // One field subrecord exists for each field in the table.
    while (dbfFile.headerLength > 32 + dbfFile.fields.length * 32) {
      const pos = 32 + dbfFile.fields.length * 32;

      if (dataView.getUint8(pos) === 0x0d) break;

      // Byte offset 0 - 10: Field name with a maximum of 10 characters.
      // If less than 10, it is padded with null characters (0x00).
      const name = substr(this.dbfFileBuffer, pos, pos + 10).split('\0')[0];

      // Byte offset 11: Field type
      const type = substr(this.dbfFileBuffer, pos + 11) as FieldType;

      // Byte offset 12-15: Displacement of field in record

      // Byte offset 16: Length of field (in bytes)
      const size = dataView.getUint8(pos + 16);

      // Byte offset 17: Number of decimal places
      const decimalPlaces = dataView.getUint8(pos + 17);

      // Byte offset 18: Field flags:
      // 0x01   System Column (not visible to user)
      // 0x02   Column can store null values
      // 0x04   Binary column (for CHAR and MEMO only)
      // 0x06   (0x02+0x04) When a field is NULL and binary (Integer, Currency, and Character/Memo fields)
      // 0x0C   Column is autoincrementing

      // Byte offset 19-22: Value of autoincrement Next value
      // Byte offset 23: Value of autoincrement Step value
      // Byte offset 24-31: Reserved

      dbfFile.fields.push({ name, type, size, decimalPlaces });
    }
  }

  private setDBFFileRecords(dbfFile: DBFFile): void {
    dbfFile.records = [];

    for (let i = 0; i < dbfFile.recordCount; i++) {
      const record: RecordType = {};

      const start = dbfFile.headerLength + dbfFile.recordLength * i;
      const end = start + dbfFile.recordLength;

      const buffer = this.dbfFileBuffer.slice(start, end);
      const dataView = new DataView(buffer);

      // First character in field indicates deletion status (asterisk === deleted)
      let offset = 0;

      if (dataView.getUint8(offset) === 0x2a) {
        record[FIELD_DELETED] = true;
      }

      offset++;

      for (const field of dbfFile.fields) {
        record[field.name] = FieldReader.read(
          dbfFile,
          field,
          buffer,
          dataView,
          offset,
          this.memoFile
        );

        offset += field.size;
      }

      dbfFile.records.push(record);
    }
  }
}
