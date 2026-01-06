# Blocked Dates Feature

The blocked dates feature allows you to prevent clients from booking appointments on specific dates (holidays, days off, maintenance days, etc.).

## How It Works

When a client tries to book an appointment:
1. The booking form fetches all blocked dates from the backend
2. If the client selects a blocked date, they see a warning message with the reason
3. The selected date is cleared and they must choose a different date
4. Time slots are not shown for blocked dates

## Managing Blocked Dates

Currently, blocked dates are managed via API calls. You can use tools like `curl`, Postman, or any HTTP client.

### API Endpoints

**Base URL**: `http://localhost:3001/blocked-dates`

### Create a Blocked Date

Block a specific date with a reason:

```bash
curl -X POST http://localhost:3001/blocked-dates \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-01-10",
    "reason": "Salon closed for maintenance"
  }'
```

**Response:**
```json
{
  "id": 1,
  "date": "2026-01-10",
  "reason": "Salon closed for maintenance",
  "createdAt": "2026-01-05T17:34:21.430Z",
  "updatedAt": "2026-01-05T17:34:21.430Z"
}
```

### Get All Blocked Dates

```bash
curl http://localhost:3001/blocked-dates
```

**Response:**
```json
[
  {
    "id": 1,
    "date": "2026-01-10",
    "reason": "Salon closed for maintenance",
    "createdAt": "2026-01-05T17:34:21.430Z",
    "updatedAt": "2026-01-05T17:34:21.430Z"
  }
]
```

### Get a Specific Blocked Date

```bash
curl http://localhost:3001/blocked-dates/1
```

### Update a Blocked Date

```bash
curl -X PATCH http://localhost:3001/blocked-dates/1 \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Holiday - New Year"
  }'
```

### Delete a Blocked Date

```bash
curl -X DELETE http://localhost:3001/blocked-dates/1
```

## Common Use Cases

### Block a Holiday

```bash
curl -X POST http://localhost:3001/blocked-dates \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-12-25",
    "reason": "Christmas Day - Salon Closed"
  }'
```

### Block for Vacation

```bash
curl -X POST http://localhost:3001/blocked-dates \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-07-04",
    "reason": "Summer vacation"
  }'
```

### Block for Training/Conference

```bash
curl -X POST http://localhost:3001/blocked-dates \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2026-03-15",
    "reason": "Staff training day"
  }'
```

## Bulk Blocking (Multiple Dates)

To block multiple dates (e.g., a week vacation), you need to create multiple blocked dates:

**Windows (PowerShell):**
```powershell
$dates = @("2026-08-01", "2026-08-02", "2026-08-03", "2026-08-04", "2026-08-05")
foreach ($date in $dates) {
    $body = @{
        date = $date
        reason = "Summer vacation week"
    } | ConvertTo-Json

    Invoke-WebRequest -Uri "http://localhost:3001/blocked-dates" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body
}
```

**Linux/Mac (Bash):**
```bash
for date in 2026-08-01 2026-08-02 2026-08-03 2026-08-04 2026-08-05; do
  curl -X POST http://localhost:3001/blocked-dates \
    -H "Content-Type: application/json" \
    -d "{\"date\":\"$date\",\"reason\":\"Summer vacation week\"}"
done
```

## Client Experience

When a client encounters a blocked date:

1. **Selects the date**: Client clicks on a blocked date in the date picker
2. **Sees warning**: A yellow warning box appears showing: "This date is not available: [reason]"
3. **Date is cleared**: The selected date is automatically cleared
4. **Must choose another date**: Client must select a different, available date

Example warning message:
```
⚠️ This date is not available: Salon closed for maintenance
```

## Database Schema

The `blocked_dates` table stores:

| Field      | Type      | Description                    |
|-----------|-----------|--------------------------------|
| id        | integer   | Primary key (auto-generated)   |
| date      | date      | The blocked date (unique)      |
| reason    | string    | Reason for blocking            |
| createdAt | timestamp | When block was created         |
| updatedAt | timestamp | Last update time               |

## Important Notes

1. **Unique Dates**: Each date can only be blocked once. If you try to block the same date twice, you'll get an error.

2. **Date Format**: Always use the format `YYYY-MM-DD` (e.g., "2026-01-10")

3. **Past Dates**: You can block past dates, but they won't affect anything since the booking form only allows future dates.

4. **Existing Appointments**: Blocking a date does NOT cancel existing appointments for that date. You need to manually handle existing appointments.

## Future Enhancements

Planned improvements for the blocked dates feature:

- [ ] Admin panel UI for managing blocked dates
- [ ] Calendar view showing blocked dates
- [ ] Bulk date blocking (date ranges)
- [ ] Recurring blocked dates (e.g., every Sunday)
- [ ] Automatic notifications to customers with appointments on newly blocked dates
- [ ] Import/export blocked dates
- [ ] Year-long holiday templates

## Troubleshooting

### "Date is already blocked" Error

If you try to block a date that's already blocked:

```json
{
  "statusCode": 409,
  "message": "This date is already blocked"
}
```

**Solution**: Update the existing blocked date or delete it first.

### Date Not Showing as Blocked

1. Verify the date was created:
   ```bash
   curl http://localhost:3001/blocked-dates
   ```

2. Check the date format is correct (YYYY-MM-DD)

3. Refresh the booking page to fetch latest blocked dates

4. Check browser console for errors

### Can't Delete Blocked Date

Make sure you're using the correct ID:

```bash
# List all blocked dates to find the ID
curl http://localhost:3001/blocked-dates

# Delete using the correct ID
curl -X DELETE http://localhost:3001/blocked-dates/{id}
```

## API Testing with Postman

1. Create a new collection called "Agnes Nails - Blocked Dates"
2. Add these requests:
   - POST `/blocked-dates` - Create
   - GET `/blocked-dates` - List all
   - GET `/blocked-dates/:id` - Get one
   - PATCH `/blocked-dates/:id` - Update
   - DELETE `/blocked-dates/:id` - Delete

3. Set base URL: `http://localhost:3001`

## Support

For issues or questions about blocked dates:
1. Check the backend logs: `docker-compose logs backend`
2. Verify the database connection
3. Test API endpoints directly
4. Review the main README.md and DOCKER.md
