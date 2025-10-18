# 🎯 **Sample Announcements Data Guide**

## **What is "Add Sample Data"?**

This means **inserting real announcement records** into your Supabase database so you can see **actual live data** flowing from the backend API to your frontend.

---

## **📦 What We Created**

### **File: `sample-announcements-seed.sql`**

A complete SQL script that inserts:
- ✅ **5 Sample Tags** (Urgent, Academic, Event, Important, Sports)
- ✅ **5 Sample Announcements** (Welcome message, Exam schedule, Sports fest, Awards, Library hours)
- ✅ **Tag Associations** (Links announcements to relevant tags)
- ✅ **Role Targeting** (Makes announcements visible to all roles: Student, Teacher, Admin)

---

## **✨ What You'll Get**

After running the SQL script:

1. **Homepage shows real announcements** from database
2. **"Live Data" badge appears** (green indicator)
3. **You can test all CRUD operations**:
   - ✅ Create new announcements
   - ✅ Edit existing announcements
   - ✅ Delete announcements
   - ✅ Add/remove tags
   - ✅ Filter by role/visibility

4. **See the full API integration working**

---

## **🚀 How to Add Sample Data**

### **Step 1: Open Supabase Dashboard**

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project: **"Southville8BNHS Database"**
3. Click on **"SQL Editor"** in the left sidebar

### **Step 2: Run the SQL Script**

1. Click **"New Query"** button
2. Copy the **entire contents** of `sample-announcements-seed.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** button (or press `Ctrl+Enter`)

### **Step 3: Verify Success**

You should see a success message:
```
✅ SAMPLE DATA INSERTED SUCCESSFULLY!
```

If you see any errors, read them carefully. Common issues:
- **Duplicate tags**: Already have tags with same name (SAFE - script handles this)
- **User not found**: Change user_id in script to your actual admin user ID
- **Permission denied**: Make sure you're logged in as project owner

---

## **🔍 Verify Data Was Inserted**

Run this query in Supabase SQL Editor to see your announcements:

```sql
SELECT 
  a.id,
  a.title,
  a.type,
  a.visibility,
  u.full_name as created_by,
  a.created_at,
  array_agg(DISTINCT t.name) as tags,
  array_agg(DISTINCT r.name) as target_roles
FROM announcements a
LEFT JOIN users u ON a.user_id = u.id
LEFT JOIN announcement_tags at ON a.id = at.announcement_id
LEFT JOIN tags t ON at.tag_id = t.id
LEFT JOIN announcement_targets atr ON a.id = atr.announcement_id
LEFT JOIN roles r ON atr.role_id = r.id
WHERE a.created_at >= NOW() - INTERVAL '1 week'
GROUP BY a.id, a.title, a.type, a.visibility, u.full_name, a.created_at
ORDER BY a.created_at DESC;
```

You should see **5 announcements** with tags and roles.

---

## **🎨 Test the Frontend**

### **Visit Homepage**

1. Open `http://localhost:3000`
2. Scroll to **"School Announcements"** section

### **What You Should See**

✅ **"Live Data" Badge** (green with pulsing dot)
- Means announcements are coming from the API

✅ **5 Real Announcements Displayed**:
1. Welcome to School Year 2025-2026!
2. First Quarter Examination Schedule Announced
3. Southville 8B NHS Sports Fest 2025
4. Congratulations to Our Academic Excellence Awardees!
5. Updated Library Operating Hours

✅ **Category Badges** (Urgent, Academic, Event, General)

✅ **Smooth Animations** (Cards slide in from bottom)

### **Test Filtering**

Click on the category buttons:
- **All Announcements** - Shows all 5
- **Urgent** - Shows exam schedule
- **Academic** - Shows academic excellence
- **Event** - Shows sports fest
- **General** - Shows welcome + library

---

## **📝 Sample Announcement Details**

### **1. Welcome to School Year 2025-2026**
- **Type**: General
- **Tags**: None (welcome message)
- **Visibility**: Public
- **Content**: Welcome message with key highlights

### **2. First Quarter Examination Schedule**
- **Type**: Urgent
- **Tags**: Urgent, Academic
- **Visibility**: Public
- **Content**: Exam dates, guidelines, preparation tips

### **3. Southville 8B NHS Sports Fest 2025**
- **Type**: Event
- **Tags**: Event, Sports
- **Visibility**: Public
- **Content**: Sports fest details, registration info

### **4. Congratulations to Our Academic Excellence Awardees**
- **Type**: Academic
- **Tags**: Academic, Important
- **Visibility**: Public
- **Content**: Award winners, ceremony details

### **5. Updated Library Operating Hours**
- **Type**: General
- **Tags**: Important
- **Visibility**: Public
- **Content**: New library hours, services

---

## **🧪 Test CRUD Operations**

### **Create New Announcement** (Admin/Teacher Only)

Use the API endpoint:
```
POST http://localhost:3004/api/v1/announcements
```

### **Edit Announcement** (Admin/Teacher Only)

Use the API endpoint:
```
PATCH http://localhost:3004/api/v1/announcements/:id
```

### **Delete Announcement** (Admin Only)

Use the API endpoint:
```
DELETE http://localhost:3004/api/v1/announcements/:id
```

---

## **🔥 Delete Sample Data (When Done Testing)**

If you want to remove the sample data:

```sql
-- Delete sample announcements created in the last week
DELETE FROM announcement_tags
WHERE announcement_id IN (
  SELECT id FROM announcements WHERE created_at >= NOW() - INTERVAL '1 week'
);

DELETE FROM announcement_targets
WHERE announcement_id IN (
  SELECT id FROM announcements WHERE created_at >= NOW() - INTERVAL '1 week'
);

DELETE FROM announcements
WHERE created_at >= NOW() - INTERVAL '1 week';

-- Optionally delete sample tags (if you don't need them)
DELETE FROM tags
WHERE name IN ('Urgent', 'Academic', 'Event', 'Important', 'Sports');
```

**Warning**: This will delete ALL announcements created in the last week, not just the sample ones!

---

## **🛡️ Is It Safe?**

✅ **100% Safe** because:
- Only `INSERT` statements (no `DELETE`/`UPDATE`/`DROP`)
- Only adds data to `announcements`, `tags`, `announcement_tags`, and `announcement_targets` tables
- Uses `ON CONFLICT DO NOTHING` to avoid duplicates
- Doesn't modify any existing data
- Easy to delete afterwards (see above)

---

## **❓ Troubleshooting**

### **Problem: "User not found" error**

**Solution**: Update the `user_id` in the SQL script to your actual admin user ID.

```sql
-- Find your admin user ID:
SELECT id, full_name, email FROM users WHERE email = 'superadmin@gmail.com';

-- Then replace 'aa0c0e87-b329-47d8-a925-76bf3f76760a' with your user ID in the script
```

### **Problem: "Permission denied" error**

**Solution**: Make sure you're logged in to Supabase as the project owner/admin.

### **Problem: "Duplicate key" error on tags**

**Solution**: This is expected! The script uses `ON CONFLICT DO NOTHING` to handle this gracefully.

### **Problem: Frontend still shows "Demo Data"**

**Solutions**:
1. **Refresh the page** (Ctrl+F5)
2. **Check if backend is running** (`http://localhost:3004/api/v1/health`)
3. **Verify announcements exist** (run verification query above)
4. **Check browser console** for API errors

### **Problem: "Live Data" badge doesn't appear**

**Solutions**:
1. **Check if API returned data** (open browser DevTools → Network → look for `/announcements` call)
2. **Verify visibility is 'public'** (run verification query)
3. **Clear browser cache** and refresh

---

## **📊 What Happens Next**

Once sample data is added:

1. **Homepage shows real announcements** ✅
2. **"Live Data" badge appears** ✅
3. **API integration is verified** ✅
4. **Phase 3 is complete** ✅
5. **Ready to move to next module** ✅

---

## **🎓 Learning Points**

This sample data demonstrates:

1. **How announcements are stored** in Supabase
2. **How tags work** (many-to-many relationship)
3. **How role targeting works** (visibility control)
4. **How the API returns data** (with joins to users, tags, roles)
5. **How the frontend displays data** (from API, not mock)

---

## **🚀 Next Steps**

After verifying the sample data works:

1. **Test on student/teacher/admin accounts** to see role-based access
2. **Create your own announcements** via the API
3. **Move to the next module integration** (Events, Quiz, etc.)
4. **Delete sample data** when you're ready to use real data

---

## **💡 Pro Tips**

- **Keep sample data** while developing other modules (useful for testing)
- **Modify sample data** to match your school's actual announcements
- **Use as templates** when creating real announcements
- **Check expiration dates** - some announcements expire after 10-60 days

---

## **📞 Need Help?**

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your backend is running
3. Check Supabase logs for errors
4. Review the SQL script for any typos
5. Ask for help with specific error messages

---

**That's it! You now have real announcements data to test your Phase 3 integration.** 🎉

