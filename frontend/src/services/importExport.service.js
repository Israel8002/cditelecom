import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { dbGetAll, dbPut } from '../db/indexeddb';

const STORES = [
  'usuarios',
  'evaluaciones',
  'fotografias',
  'respaldos',
  'logs',
  'configuracion',
  'equipos',
  'pendientes'
];

export async function exportDatabaseToZip() {
  const zip = new JSZip();
  const data = {};

  for (const store of STORES) {
    let items = await dbGetAll(store);
    
    if (store === 'fotografias') {
      items = items.map(item => {
        if (item.blob) {
          zip.file(`blobs/fotos/${item.id}`, item.blob);
          const { blob, ...rest } = item;
          return { ...rest, _hasBlob: true };
        }
        return item;
      });
    } else if (store === 'respaldos') {
      items = items.map(item => {
        const cleanItem = { ...item };
        const blobFields = ['pdf', 'json', 'pdfFotos', 'pdfOficio'];
        blobFields.forEach(field => {
          if (cleanItem[field]) {
            zip.file(`blobs/respaldos/${item.id}_${field}`, cleanItem[field]);
            delete cleanItem[field];
            cleanItem[`_has_${field}`] = true;
          }
        });
        return cleanItem;
      });
    }

    data[store] = items;
  }

  zip.file('database.json', JSON.stringify(data));

  const content = await zip.generateAsync({ type: 'blob' });
  
  const d = new Date();
  const dateStr = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth()+1).padStart(2, '0')}${d.getFullYear()}`;
  saveAs(content, `respaldo_${dateStr}.zip`);
}

export async function importDatabaseFromZip(file) {
  const zip = await JSZip.loadAsync(file);
  const jsonFile = zip.file('database.json');
  if (!jsonFile) {
    throw new Error("No se encontró database.json en el archivo ZIP. Asegúrate de que es un respaldo válido.");
  }
  
  const jsonStr = await jsonFile.async('string');
  const data = JSON.parse(jsonStr);

  for (const store of STORES) {
    if (!data[store]) continue;
    
    for (let item of data[store]) {
      // Reconstruct blobs for fotografias
      if (store === 'fotografias' && item._hasBlob) {
        const fileInZip = zip.file(`blobs/fotos/${item.id}`);
        if (fileInZip) {
          const blob = await fileInZip.async('blob');
          item.blob = blob;
        }
        delete item._hasBlob;
      } 
      // Reconstruct blobs for respaldos
      else if (store === 'respaldos') {
        const blobFields = ['pdf', 'json', 'pdfFotos', 'pdfOficio'];
        for (const field of blobFields) {
          if (item[`_has_${field}`]) {
            const fileInZip = zip.file(`blobs/respaldos/${item.id}_${field}`);
            if (fileInZip) {
              const blob = await fileInZip.async('blob');
              item[field] = blob;
            }
            delete item[`_has_${field}`];
          }
        }
      }
      
      // Upsert into DB
      await dbPut(store, item);
    }
  }
}
