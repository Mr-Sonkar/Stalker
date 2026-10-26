import { extractImageMetadata } from '../metadata/image-metadata';
import { extractPdfMetadata } from '../metadata/pdf-metadata';
import { extractDocxMetadata } from '../metadata/docx-metadata';
import { runMetadataScan } from '../metadata';
import exifr from 'exifr';
import { PDFDocument } from 'pdf-lib';

// Mock dependencies
jest.mock('exifr');
jest.mock('pdf-lib');

describe('Metadata Extractor', () => {
  const dummyBuffer = Buffer.from('dummy data');

  describe('extractImageMetadata', () => {
    it('should return gps and device data if present', async () => {
      (exifr.parse as jest.Mock).mockResolvedValue({
        latitude: 40.7128,
        longitude: -74.0060,
        Make: 'Apple',
        Model: 'iPhone 13',
        Software: 'iOS 15.0',
      });

      const findings = await extractImageMetadata(dummyBuffer);
      expect(findings.length).toBe(3);
      expect(findings[0].type).toBe('gps');
      expect(findings[1].type).toBe('device');
      expect(findings[2].type).toBe('software');
    });

    it('should return empty array if no exif data', async () => {
      (exifr.parse as jest.Mock).mockResolvedValue(null);
      const findings = await extractImageMetadata(dummyBuffer);
      expect(findings.length).toBe(0);
    });
  });

  describe('extractPdfMetadata', () => {
    it('should return author and creator if present', async () => {
      const mockPdfDoc = {
        getAuthor: jest.fn().mockReturnValue('John Doe'),
        getCreator: jest.fn().mockReturnValue('Adobe Acrobat'),
        getProducer: jest.fn().mockReturnValue(undefined),
        getCreationDate: jest.fn().mockReturnValue(new Date('2023-01-01')),
        getModificationDate: jest.fn().mockReturnValue(undefined),
      };

      (PDFDocument.load as jest.Mock).mockResolvedValue(mockPdfDoc);

      const findings = await extractPdfMetadata(dummyBuffer);
      expect(findings.length).toBe(3); // author, creator, creationDate
      expect(findings[0].type).toBe('author');
      expect(findings[1].type).toBe('software');
      expect(findings[2].type).toBe('timestamp');
    });

    it('should handle errors gracefully', async () => {
      (PDFDocument.load as jest.Mock).mockRejectedValue(new Error('Invalid PDF'));
      const findings = await extractPdfMetadata(dummyBuffer);
      expect(findings.length).toBe(0);
    });
  });

  describe('extractDocxMetadata', () => {
    it('should return empty findings since it is not fully implemented', async () => {
      const findings = await extractDocxMetadata(dummyBuffer);
      expect(findings.length).toBe(0);
    });
  });

  describe('runMetadataScan', () => {
    it('should orchestrate based on file type', async () => {
      (exifr.parse as jest.Mock).mockResolvedValue({
        Make: 'Samsung',
      });

      const result = await runMetadataScan('test.jpg', 'image/jpeg', dummyBuffer);
      expect(result.length).toBe(1);
      expect(result[0].fileName).toBe('test.jpg');
      expect(result[0].findings[0].type).toBe('device');
    });
  });
});
