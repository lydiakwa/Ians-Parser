import type { FileVersion } from "./types";

// https://www.dbf2002.com/dbf-file-format.html
const FILE_VERSION = {
  FoxBASE: { code: 0x02, name: "FoxBASE" },
  FoxBASEPlusOrdBASEIIIPlusNoMemo: {
    code: 0x03,
    name: "FoxBASE+/Dbase III plus, no memo",
  },
  VisualFoxPro: { code: 0x30, name: "Visual FoxPro" },
  VisualFoxProWithAutoIncrement: {
    code: 0x31,
    name: "Visual FoxPro, autoincrement enabled",
  },
  VisualFoxProWithVarChar: {
    code: 0x32,
    name: "Visual FoxPro with field type Varchar or Varbinary",
  },
  dBASEIVSQLTableFileNoMemo: {
    code: 0x43,
    name: "dBASE IV SQL table files, no memo",
  },
  dBASEIVSQLSystemFileNoMemo: {
    code: 0x63,
    name: "dBASE IV SQL system files, no memo",
  },
  FoxBASEPlusOrdBASEIIIPlusWithMemo: {
    code: 0x83,
    name: "FoxBASE+/dBASE III PLUS, with memo",
  },
  dBASEIVWithMemo: { code: 0x8b, name: "dBASE IV with memo" },
  dBASEIVSQLTableFilesWithMemo: {
    code: 0xcb,
    name: "dBASE IV SQL table files, with memo",
  },
  FoxPro2WithMemo: { code: 0xf5, name: "FoxPro 2.x (or earlier) with memo" },
  PiHerSixWithSMTMemo: {
    code: 0xe5,
    name: "HiPer-Six format with SMT memo file",
  },
  FoxBASEAlt: { code: 0xfb, name: "FoxBASE" },
};

export function fileVersionForCode(code: number): FileVersion {
  for (const fileVersion of Object.values(FILE_VERSION)) {
    if (fileVersion.code === code) {
      return fileVersion;
    }
  }

  throw new Error(`Unknown file version: ${code}`);
}

export default FILE_VERSION;
