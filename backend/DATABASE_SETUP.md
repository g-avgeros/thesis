# Database Setup for Professional Schedules

This guide will help you add the new `professional_schedules` table to your existing `freelancing_appointments` database.

## Option 1: Using SQL Script (Recommended)

1. **Open your MySQL database management tool** (phpMyAdmin, MySQL Workbench, or command line)

2. **Run the SQL script**:
   ```sql
   -- Copy and paste the contents of create_schedules_table.sql
   ```

3. **Verify the table was created**:
   ```sql
   SHOW TABLES LIKE 'professional_schedules';
   DESCRIBE professional_schedules;
   ```

## Option 2: Using Python Migration Script

1. **Make sure your Flask app is configured** with the correct database credentials

2. **Run the migration script**:
   ```bash
   cd backend
   python migrate_schedules.py
   ```

## Database Schema

The new `professional_schedules` table has the following structure:

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT AUTO_INCREMENT | Primary key |
| `professional_id` | INT | Foreign key to professionals table |
| `day_of_week` | ENUM | Day of the week (monday, tuesday, etc.) |
| `start_time` | TIME | Start time for the day |
| `end_time` | TIME | End time for the day |
| `is_available` | BOOLEAN | Whether the professional is available on this day |
| `created_at` | TIMESTAMP | When the record was created |
| `updated_at` | TIMESTAMP | When the record was last updated |

## API Endpoints

The following API endpoints are now available:

- `GET /schedules?professional_id={id}` - Get all schedules for a professional
- `POST /schedules` - Create or update multiple schedules
- `PUT /schedules/{id}` - Update a specific schedule
- `DELETE /schedules/{id}` - Delete a specific schedule
- `DELETE /schedules/professional/{id}` - Delete all schedules for a professional

## Frontend Integration

The Schedule page now:
- Loads existing schedules when the page loads
- Saves schedules to the database when "Αποθήκευση Όλων" is clicked
- Shows success/error messages based on API responses
- Validates data before saving

## Testing

1. **Start your Flask backend**:
   ```bash
   cd backend
   python app.py
   ```

2. **Start your React frontend**:
   ```bash
   cd frontend
   npm start
   ```

3. **Test the schedule functionality**:
   - Navigate to the Schedule page
   - Toggle days on/off
   - Set start and end times
   - Click "Αποθήκευση Όλων"
   - Verify the data is saved and loaded correctly

## Troubleshooting

### Common Issues:

1. **Table already exists**: The SQL script uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

2. **Foreign key constraint errors**: Make sure you have at least one professional in your `professionals` table before creating schedules.

3. **API connection errors**: Check that your Flask backend is running on `http://localhost:5000` and CORS is properly configured.

4. **Authentication errors**: Make sure the user is logged in and has a valid `userId` in localStorage.

### Verification Queries:

```sql
-- Check if table exists
SHOW TABLES LIKE 'professional_schedules';

-- Check table structure
DESCRIBE professional_schedules;

-- Check for sample data
SELECT * FROM professional_schedules;

-- Check foreign key relationships
SELECT 
    ps.id, 
    ps.day_of_week, 
    ps.start_time, 
    ps.end_time, 
    ps.is_available,
    p.full_name as professional_name
FROM professional_schedules ps
JOIN professionals p ON ps.professional_id = p.id;
```
