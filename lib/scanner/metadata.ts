import { MetadataFinding, MetadataItem } from './types';
import { extractImageMetadata } from './metadata/image-metadata';
import { extractPdfMetadata } from './metadata/pdf-metadata';
import { extractDocxMetadata } from './metadata/docx-metadata';

export async function runMetadataScan(
  fileName: string,
  fileType: string,
  buffer: Buffer
): Promise<MetadataFinding[]> {
  let findings: MetadataItem[] = [];

  try {
    if (fileType.startsWith('image/')) {
      findings = await extractImageMetadata(buffer);
    } else if (fileType === 'application/pdf') {
      findings = await extractPdfMetadata(buffer);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileName.endsWith('.docx')
    ) {
      findings = await extractDocxMetadata(buffer);
    }
  } catch (error) {
    console.error('Error in metadata scan', error);
  }

  if (findings.length > 0) {
    return [
      {
        fileName,
        fileType,
        findings,
      },
    ];
  }

  return [];
}
