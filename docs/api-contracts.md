# API Contracts

## POST /api/scan

### Request
Content-Type: `multipart/form-data` (preferred) or `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address (RFC 5322) |
| file | File | No | Image/PDF/DOCX for metadata scanning (max 10MB) |
| bioText | string | No | Plain text bio for PII analysis (max 5000 chars) |
| screenshot | File | No | Profile screenshot for OCR (max 5MB, image/*) |

### Response (200)
```json
{
  "success": true,
  "scanId": "scan_cuid",
  "report": {
    "id": "scan_cuid",
    "target": "user@example.com",
    "scannedAt": "2026-09-06T12:00:00.000Z",
    "threatLevel": "MODERATE",
    "riskScore": 35,
    "summary": {
      "summary": {
      "totalBreaches": 2,
      "exposedDataClasses": ["Email addresses", "Passwords (bcrypt)", "Names"],
      "exposedAccountsCount": 1,
      "hasPlaintextPasswordLeak": false
    },
    "domainInfo": {
      "domain": "example.com",
      "isDisposable": false,
      "hasMxRecords": true,
      "providerType": "custom"
    },
    "breaches": [...],
    "accountExposures": [...],
    "metadataFindings": [...],      // Optional - Phase 2
    "profileTextFindings": [...],   // Optional - Phase 3
    "recommendations": [...]
  }
}
```

### Error Responses

| Status | Code | Message |
|--------|------|---------|
| 400 | INVALID_EMAIL | "Invalid email format" |
| 400 | FILE_TOO_LARGE | "File exceeds 10MB limit" |
| 400 | INVALID_FILE_TYPE | "Unsupported file type" |
| 413 | PAYLOAD_TOO_LARGE | "Request payload too large" |
| 500 | SCAN_FAILED | "Scan execution failed" |
| 503 | SERVICE_UNAVAILABLE | "Scanner modules temporarily unavailable" |

## GET /api/export/:scanId

### Request
| Param | Type | Required |
|-------|------|----------|
| scanId | string (cuid) | Yes |

### Response (200)
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="privacy-report-{scanId}.pdf"`

### Error Responses
| Status | Code | Message |
|--------|------|---------|
| 404 | SCAN_NOT_FOUND | "Scan report not found" |
| 500 | EXPORT_FAILED | "PDF generation failed" |