import Form from './components/design/form';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { fileToArrayBuffer } from './dbf-file-reader/utils';
import { DBFFileReader } from './dbf-file-reader';
import React, { useState } from 'react';
import type { DBFFile } from './dbf-file-reader/types';
import FileViewer from './FileViewer';
import Tab from './components/design/Tab';

interface IFormValues {
  files: FileList;
}

interface NamedDBFFile {
  name: string;
  dbfFile: DBFFile;
}

function App() {
  const { register, handleSubmit } = useForm<IFormValues>();
  const [dbfFiles, setDbfFiles] = useState<NamedDBFFile[]>([]);

  const onSubmit: SubmitHandler<IFormValues> = async ({ files }) => {
    const dbfFiles = [...files].filter((file) =>
      file.name.toLowerCase().endsWith('.dbf')
    );
    const memoFiles = [...files].filter((file) =>
      file.name.toLowerCase().endsWith('.fpt')
    );

    const namedDBFFiles: NamedDBFFile[] = [];

    for (const file of dbfFiles) {
      const name = file.name.split('.')[0];
      const memoFile = memoFiles.find((file) => file.name === `${name}.fpt`);

      const dbfArrayBuffer = await fileToArrayBuffer(file);
      const memoArrayBuffer = memoFile && (await fileToArrayBuffer(memoFile));

      const reader = new DBFFileReader(dbfArrayBuffer, memoArrayBuffer);

      const dbfFile = await reader.read();

      namedDBFFiles.push({ name, dbfFile });
    }

    setDbfFiles(namedDBFFiles);
  };

  return (
    <main className="container mx-auto my-5">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group name="files">
          <Form.Label>Files</Form.Label>
          <Form.FileInput multiple register={register} />
        </Form.Group>
        <Form.Submit>Parse</Form.Submit>
      </Form>
      {dbfFiles.length > 0 ? (
        <Tab activeTab={dbfFiles[0].name}>
          {dbfFiles.map(({ name, dbfFile }) => (
            <React.Fragment key={name}>
              <Tab.Link id={name} title={`${name}.dbf`} />
              <Tab.Content id={name}>
                <FileViewer dbf={dbfFile} name={name} />
              </Tab.Content>
            </React.Fragment>
          ))}
        </Tab>
      ) : null}
    </main>
  );
}

export default App;
