import FILE_VERSION from "./file-version-identifiers";
import type { DBFFile, Field, FieldType, RecordValue } from "./types";
import { parse8CharDate, substr } from "./utils";

class FieldReader {
  dbfFile: DBFFile;
  field: Field;
  buffer: ArrayBuffer;
  dataView: DataView;
  memoBuffer?: ArrayBuffer;

  static read(
    dbfFile: DBFFile,
    field: Field,
    buffer: ArrayBuffer,
    dataView: DataView,
    position: number,
    memoBuffer?: ArrayBuffer
  ) {
    const Reader = readerForType[field.type] || this;

    return new Reader(dbfFile, field, buffer, dataView, memoBuffer).read(
      position
    );
  }

  constructor(
    dbfFile: DBFFile,
    field: Field,
    buffer: ArrayBuffer,
    dataView: DataView,
    memoBuffer?: ArrayBuffer
  ) {
    this.dbfFile = dbfFile;
    this.field = field;
    this.buffer = buffer;
    this.dataView = dataView;
    this.memoBuffer = memoBuffer;
  }

  read(_position?: number): RecordValue {
    return null;
  }
}

// Field Type: C
// Mnemonic: Character
// What it accepts: Any ASCII text (padded with spaces up to the field's length)
class TextFieldReader extends FieldReader {
  read(position: number): string {
    let len = this.field.size;

    while (len > 0 && this.dataView.getUint8(position + len - 1) === 0x20) {
      len--;
    }

    return substr(this.buffer, position, position + len);
  }
}

// Field Type: N, F
// Mnemonic: Numeric
// What it accepts: -, ., 0–9 (right justified, padded with whitespaces)
class NumberFieldReader extends FieldReader {
  read(position: number): number | null {
    let numberStart = position;
    let len = this.field.size;

    while (len > 0 && this.dataView.getUint8(numberStart) === 0x20) {
      numberStart++;
      len--;
    }

    if (len > 0) {
      return parseFloat(substr(this.buffer, numberStart, numberStart + len));
    } else {
      return null;
    }
  }
}

class CurrencyFieldReader extends FieldReader {
  read(position: number): number {
    return Number(this.dataView.getBigInt64(position, true)) / 10000;
  }
}

// Field Type: L
// Mnemonic: Logical
// What it accepts: Y, y, N, n, T, t, F, f, or ? (when uninitialized)
class LogicalFieldReader extends FieldReader {
  read(position: number): boolean | null {
    const char = String.fromCharCode(this.dataView.getUint8(position));
    if ("TtYy".indexOf(char) >= 0) {
      return true;
    } else if ("FfNn".indexOf(char) >= 0) {
      return false;
    } else {
      return null;
    }
  }
}

class DateTimeFieldReader extends FieldReader {
  read(position: number): string | null {
    if (this.dataView.getUint8(position) !== 0x20) {
      // TODO: parse datetime
      return substr(this.buffer, position, position + 8);
    } else {
      return null;
    }
  }
}

// Field Type: D
// Mnemonic: Date
// What it accepts: Numbers and a character to separate month, day, and year
// (stored internally as 8 digits in YYYYMMDD format)
class DateFieldReader extends FieldReader {
  read(position: number): Date | null {
    if (this.dataView.getUint8(position) !== 0x20) {
      return parse8CharDate(substr(this.buffer, position, position + 8));
    } else {
      return null;
    }
  }
}

class DoubleFieldReader extends FieldReader {
  read(position: number): number {
    return this.dataView.getFloat64(position, true);
  }
}

class IntegerFieldReader extends FieldReader {
  read(position: number): number {
    return this.dataView.getInt32(position, true);
  }
}

// Field Type: M
// Mnemonic: Memo
// What it accepts: Any ASCII text (stored internally as 10 digits representing a .dbt block number, right justified, padded with whitespaces)
class MemoFieldReader extends FieldReader {
  read(position: number): string | null {
    if (!this.memoBuffer) return null;

    const blockIndex =
      this.dbfFile.fileVersion === FILE_VERSION.VisualFoxPro
        ? this.dataView.getInt32(position, true)
        : parseInt(substr(this.buffer, position, position + this.field.size));

    if (isNaN(blockIndex) || blockIndex === 0) return null;

    if (
      this.dbfFile.fileVersion === FILE_VERSION.VisualFoxPro ||
      this.dbfFile.fileVersion === FILE_VERSION.FoxPro2WithMemo
    ) {
      const memoDataView = new DataView(this.memoBuffer);
      // Memo Block
      // 00 - 03: Type: 0 = image, 1 = text
      // 04 - 07: Length
      // 08 - N : Data
      const memoBlockStart = this.dbfFile.memoBlockSize * blockIndex;
      const memoBlockType = memoDataView.getInt32(memoBlockStart);
      const memoBlockDataStart = memoBlockStart + 8;

      if (memoBlockType !== 1) return null;

      const memoBlockLength = memoDataView.getInt32(memoBlockStart + 4);

      return substr(
        this.memoBuffer,
        memoBlockDataStart,
        memoBlockDataStart + memoBlockLength
      );
    }

    return null;
  }
}

const readerForType: Record<FieldType, typeof FieldReader> = {
  C: TextFieldReader,
  N: NumberFieldReader,
  F: NumberFieldReader,
  Y: CurrencyFieldReader,
  L: LogicalFieldReader,
  T: DateTimeFieldReader,
  D: DateFieldReader,
  B: DoubleFieldReader,
  I: IntegerFieldReader,
  M: MemoFieldReader,
};

export default FieldReader;
