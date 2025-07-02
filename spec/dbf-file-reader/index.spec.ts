import { expect, test, describe } from "vitest";

import { DBFFileReader } from "../../src/dbf-file-reader";
import VisualFoxProDBFFile from "../fixtures/dbase_30.dbf?file";
import VisualFoxProDBFMemoFile from "../fixtures/dbase_30.fpt?file";
import FILE_VERSION from "../../src/dbf-file-reader/file-version-identifiers";

describe("reading a dbf file", () => {
  test("reads a Visual FoxPro file with a memo file", async () => {
    const dbfFile = await VisualFoxProDBFFile.arrayBuffer();
    const memoFile = await VisualFoxProDBFMemoFile.arrayBuffer();
    const reader = new DBFFileReader(dbfFile, memoFile);
    const dbf = await reader.read();

    expect(dbf.fileVersion).toBe(FILE_VERSION.VisualFoxPro);
    expect(dbf.hasMemoField).toBe(true);
    expect(dbf.recordCount).toBe(34);

    expect(dbf.fields[0].name).toBe("ACCESSNO");
    expect(dbf.fields[0].type).toBe("C");
    expect(dbf.fields[0].size).toBe(15);
    expect(dbf.fields[0].decimalPlaces).toBe(0);

    expect(dbf.fields[1].name).toBe("ACQVALUE");
    expect(dbf.fields[1].type).toBe("N");
    expect(dbf.fields[1].size).toBe(12);
    expect(dbf.fields[1].decimalPlaces).toBe(2);

    expect(dbf.fields[8].name).toBe("CATDATE");
    expect(dbf.fields[8].type).toBe("D");
    expect(dbf.fields[8].size).toBe(8);
    expect(dbf.fields[8].decimalPlaces).toBe(0);

    expect(dbf.fields[10].name).toBe("CLASSES");
    expect(dbf.fields[10].type).toBe("M");
    expect(dbf.fields[10].size).toBe(4);
    expect(dbf.fields[10].decimalPlaces).toBe(0);

    expect(dbf.records[3].ACCESSNO).toEqual("1999.1");
    expect(dbf.records[3].ACQVALUE).toEqual(0);
    expect(dbf.records[3].CATDATE).toEqual(new Date("1999-03-05"));
    expect(dbf.records[3].CLASSES).toEqual(
      "Agriculture\r\nFarms & Farming\r\n"
    );
  });

  test("reads a Visual FoxPro file without a memo file", async () => {
    const dbfFile = await VisualFoxProDBFFile.arrayBuffer();
    const reader = new DBFFileReader(dbfFile);
    const dbf = await reader.read();

    expect(dbf.fileVersion).toBe(FILE_VERSION.VisualFoxPro);
    expect(dbf.hasMemoField).toBe(true);
    expect(dbf.recordCount).toBe(34);

    expect(dbf.fields[0].name).toBe("ACCESSNO");
    expect(dbf.fields[1].name).toBe("ACQVALUE");
    expect(dbf.fields[8].name).toBe("CATDATE");
    expect(dbf.fields[10].name).toBe("CLASSES");

    expect(dbf.records[3].ACCESSNO).toEqual("1999.1");
    expect(dbf.records[3].ACQVALUE).toEqual(0);
    expect(dbf.records[3].CATDATE).toEqual(new Date("1999-03-05"));
    expect(dbf.records[3].CLASSES).toEqual(null);
  });
});
