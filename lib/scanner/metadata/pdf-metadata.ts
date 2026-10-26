import { PDFDocument } from 'pdf-lib';
import { MetadataItem } from '../types';

export async function extractPdfMetadata(buffer: Buffer): Promise<MetadataItem[]> {
  const findings: MetadataItem[] = [];
  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    
    const author = pdfDoc.getAuthor();
    if (author) {
      findings.push({
        type: 'author',
        label: 'Author',
        value: author,
        riskLevel: 'MODERATE',
      });
    }

    const creator = pdfDoc.getCreator();
    if (creator) {
      findings.push({
        type: 'software',
        label: 'Creator',
        value: creator,
        riskLevel: 'MODERATE',
      });
    }

    const producer = pdfDoc.getProducer();
    if (producer) {
      findings.push({
        type: 'software',
        label: 'Producer',
        value: producer,
        riskLevel: 'LOW',
      });
    }

    const creationDate = pdfDoc.getCreationDate();
    if (creationDate) {
      findings.push({
        type: 'timestamp',
        label: 'Creation Date',
        value: creationDate.toISOString(),
        riskLevel: 'LOW',
      });
    }

    const modDate = pdfDoc.getModificationDate();
    if (modDate) {
      findings.push({
        type: 'timestamp',
        label: 'Modification Date',
        value: modDate.toISOString(),
        riskLevel: 'LOW',
      });
    }
    
  } catch (error) {
    console.error('Error parsing PDF data', error);
  }

  return findings;
}
