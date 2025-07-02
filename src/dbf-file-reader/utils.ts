async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = function () {
      const buffer = reader.result;
      if (buffer instanceof ArrayBuffer) {
        resolve(buffer);
      } else {
        reject();
      }
    };

    reader.onerror = reject;
  });
}

function substr(buffer: ArrayBuffer, start: number, end?: number): string {
  if (end === undefined) {
    end = start + 1;
  }
  return String.fromCharCode(...new Uint8Array(buffer.slice(start, end)));
}

// Parses an 8-character date string of the form 'YYYYMMDD' into a Date object.
function parse8CharDate(dateStr: string): Date {
  return new Date(
    `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`
  );
}

export { fileToArrayBuffer, parse8CharDate, substr };
