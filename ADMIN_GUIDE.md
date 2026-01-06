# Admin Panel Guide

## Accessing the Admin Panel

The admin panel allows you to view and manage all appointments in the system.

### URL
```
http://localhost:3000/admin/appointments
```

### Login Credentials

**Password:** `admin123`

> **IMPORTANT:** This password is currently hardcoded in the application. For production use, you should:
> 1. Change the password in `frontend/src/app/admin/appointments/page.tsx` (line 16)
> 2. Implement proper authentication with environment variables
> 3. Consider using a proper authentication system (NextAuth.js, Auth0, etc.)

### Changing the Admin Password

To change the admin password:

1. Open `frontend/src/app/admin/appointments/page.tsx`
2. Find line 16: `const ADMIN_PASSWORD = 'admin123';`
3. Replace `'admin123'` with your desired password
4. Rebuild the frontend: `docker-compose up -d --build frontend`

## Features

### Dashboard Overview

The admin panel provides:

1. **Statistics Cards**
   - Total appointments
   - Pending appointments
   - Confirmed appointments
   - Completed appointments

2. **Filters**
   - Filter by date - View appointments for specific dates
   - Filter by status - View appointments by their current status

3. **Appointment Table**
   Display of all appointments with the following information:
   - ID
   - Date and Time
   - Customer Name
   - Email
   - Phone Number
   - Service Type
   - Notes
   - Status
   - Created Date

### Managing Appointments

#### Update Appointment Status

Each appointment has a status dropdown with the following options:
- **Pending** - New appointment requests (default)
- **Confirmed** - Appointment has been confirmed
- **Completed** - Service has been completed
- **Cancelled** - Appointment was cancelled

To change status:
1. Click on the status dropdown for the appointment
2. Select the new status
3. The status is automatically saved to the database

#### Delete Appointments

To delete an appointment:
1. Click the "Delete" button in the Actions column
2. Confirm the deletion in the popup dialog
3. The appointment will be permanently removed

### Session Management

- Authentication is stored in browser session storage
- You remain logged in until you click "Logout" or close the browser
- The "Refresh" button reloads the appointments from the database

## Security Considerations

### Current Implementation

The current implementation uses:
- Simple password protection
- Session storage for authentication state
- No encryption for password transmission

### Recommended for Production

For a production environment, implement:

1. **Environment Variables**
   ```env
   NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-password-here
   ```

2. **Proper Authentication**
   - Use NextAuth.js for authentication
   - Implement JWT tokens
   - Add role-based access control
   - Use HTTPS for all connections

3. **Backend Validation**
   - Add authentication middleware in NestJS
   - Protect API endpoints with guards
   - Implement rate limiting

4. **Additional Security**
   - Add two-factor authentication (2FA)
   - Log all admin actions
   - Implement session timeouts
   - Use secure password hashing

## API Endpoints Used

The admin panel interacts with the following API endpoints:

- `GET /appointments` - Fetch all appointments
- `PATCH /appointments/:id` - Update appointment status
- `DELETE /appointments/:id` - Delete an appointment

## Troubleshooting

### Cannot Access Admin Panel

1. Verify the frontend container is running:
   ```bash
   docker-compose ps
   ```

2. Check if the URL is correct:
   ```
   http://localhost:3000/admin/appointments
   ```

3. Clear browser cache and session storage

### Login Not Working

1. Verify you're using the correct password (default: `admin123`)
2. Check browser console for errors
3. Ensure the backend API is accessible

### Appointments Not Loading

1. Check backend container status:
   ```bash
   docker-compose logs backend
   ```

2. Verify database connection in backend logs
3. Test API endpoint directly:
   ```bash
   curl http://localhost:3001/appointments
   ```

### Status Update Not Saving

1. Check backend logs for errors
2. Verify CORS is enabled in backend
3. Check network tab in browser DevTools

## Future Enhancements

Recommended features to add:

- [ ] Export appointments to CSV/Excel
- [ ] Email notifications to customers
- [ ] Calendar view of appointments
- [ ] Search and advanced filtering
- [ ] Bulk operations
- [ ] Customer management
- [ ] Service management
- [ ] Revenue tracking
- [ ] Analytics dashboard
- [ ] Appointment reminders
- [ ] Staff management
- [ ] Time slot management

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f frontend backend`
2. Review the main README.md
3. Check the DOCKER.md guide
