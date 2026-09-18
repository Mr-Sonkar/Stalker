import exifr from 'exifr';
import { MetadataItem } from '../types';

export async function extractImageMetadata(buffer: Buffer): Promise<MetadataItem[]> {
  const findings: MetadataItem[] = [];
  try {
    const exifData = await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      gps: true,
    });

    if (!exifData) return findings;

    if (exifData.latitude && exifData.longitude) {
      findings.push({
        type: 'gps',
        label: 'GPS Location',
        value: `${exifData.latitude}, ${exifData.longitude}`,
        riskLevel: 'HIGH',
      });
    }

    const deviceMake = exifData.Make;
    const deviceModel = exifData.Model;
    if (deviceMake || deviceModel) {
      findings.push({
        type: 'device',
        label: 'Device',
        value: `${deviceMake || ''} ${deviceModel || ''}`.trim(),
        riskLevel: 'MODERATE',
      });
    }

    if (exifData.Software) {
      findings.push({
        type: 'software',
        label: 'Software',
        value: String(exifData.Software),
        riskLevel: 'LOW',
      });
    }

    if (exifData.DateTimeOriginal || exifData.CreateDate) {
      const date = exifData.DateTimeOriginal || exifData.CreateDate;
      findings.push({
        type: 'timestamp',
        label: 'Creation Date',
        value: date instanceof Date ? date.toISOString() : String(date),
        riskLevel: 'LOW',
      });
    }
  } catch (error) {
    console.error('Error parsing EXIF data', error);
  }

  return findings;
}
