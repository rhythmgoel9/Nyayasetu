# NyayaSetu Advanced Analytics API

The analytics dashboard reads case records from `server/data/cases.json` through the backend. The file starts empty by design: no demo/seed cases are included.

## Read analytics

`GET /api/v1/analytics`

Optional query parameters:

- `from=YYYY-MM-DD`
- `to=YYYY-MM-DD`

Example:

`GET http://localhost:5000/api/v1/analytics?from=2026-09-01&to=2026-09-30`

## Add/update a real case record

`POST /api/v1/analytics/cases`

JSON body must include `id` (or `firId`) and `filedDate` (or `createdAt`/`date`). Other FIR/case fields are accepted and used for analytics.

Example body:

```json
{
  "id": "FIR-2026-DL-10001",
  "type": "cybercrime",
  "status": "underInvestigation",
  "filedDate": "2026-09-11T10:30:00+05:30",
  "location": "Cyber Police Station"
}
```

The endpoint is intentionally separate from the Voice FIR code. Connect your real FIR creation service to this endpoint when your team wires the main FIR database/API.
