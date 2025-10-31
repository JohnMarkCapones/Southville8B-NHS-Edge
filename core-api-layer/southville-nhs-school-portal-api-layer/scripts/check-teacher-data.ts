import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TEACHER_USER_ID = 'b4c3204d-1f85-4256-9b9d-cdbc9f768527';

async function checkTeacherData() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('\n===========================================');
  console.log('🔍 TEACHER DATA DIAGNOSTIC SCRIPT');
  console.log('===========================================\n');
  console.log(`Teacher User ID: ${TEACHER_USER_ID}\n`);

  // 1. Check if teacher user exists
  console.log('📋 Step 1: Checking if teacher user exists...');
  const { data: teacher, error: teacherError } = await supabase
    .from('users')
    .select('*')
    .eq('id', TEACHER_USER_ID)
    .single();

  if (teacherError || !teacher) {
    console.error('❌ Teacher user NOT FOUND in database');
    console.error('Error:', teacherError?.message);
    process.exit(1);
  }

  console.log('✅ Teacher user found:');
  console.log(`   - Name: ${teacher.full_name}`);
  console.log(`   - Email: ${teacher.email}`);
  console.log(`   - Role: ${teacher.role}\n`);

  // 2. Check advisory sections (sections where teacher is adviser)
  console.log('📋 Step 2: Checking advisory sections...');
  const { data: advisorySections, error: advisoryError } = await supabase
    .from('sections')
    .select('*')
    .eq('teacher_id', TEACHER_USER_ID);

  if (advisoryError) {
    console.error('❌ Error fetching advisory sections:', advisoryError.message);
  } else if (!advisorySections || advisorySections.length === 0) {
    console.log('⚠️  NO ADVISORY SECTIONS assigned to this teacher');
  } else {
    console.log(`✅ Found ${advisorySections.length} advisory section(s):`);
    advisorySections.forEach((section, idx) => {
      console.log(`   ${idx + 1}. ${section.name} (Grade ${section.grade_level}) - Status: ${section.status}`);
    });
  }
  console.log('');

  // 3. Check students in advisory sections
  console.log('📋 Step 3: Checking students in advisory sections...');
  if (!advisorySections || advisorySections.length === 0) {
    console.log('⚠️  Skipping - No advisory sections to check\n');
  } else {
    let totalAdvisoryStudents = 0;
    for (const section of advisorySections) {
      const { data: students, error: studentsError } = await supabase
        .from('section_students')
        .select('student_id, students(id, first_name, last_name, student_id)')
        .eq('section_id', section.id);

      if (studentsError) {
        console.error(`   ❌ Error fetching students for section ${section.name}:`, studentsError.message);
      } else if (!students || students.length === 0) {
        console.log(`   ⚠️  Section ${section.name}: 0 students`);
      } else {
        console.log(`   ✅ Section ${section.name}: ${students.length} student(s)`);
        totalAdvisoryStudents += students.length;
      }
    }
    console.log(`   TOTAL ADVISORY STUDENTS: ${totalAdvisoryStudents}\n`);
  }

  // 4. Check schedules (subject classes taught by teacher)
  console.log('📋 Step 4: Checking teacher schedules (subject classes)...');
  const { data: schedules, error: schedulesError } = await supabase
    .from('schedules')
    .select('*')
    .eq('teacher_id', TEACHER_USER_ID);

  if (schedulesError) {
    console.error('❌ Error fetching schedules:', schedulesError.message);
  } else if (!schedules || schedules.length === 0) {
    console.log('⚠️  NO SCHEDULES (subject classes) assigned to this teacher');
  } else {
    console.log(`✅ Found ${schedules.length} schedule(s):`);
    schedules.forEach((schedule, idx) => {
      console.log(`   ${idx + 1}. Schedule ID: ${schedule.id} - Subject: ${schedule.subject_id} - Section: ${schedule.section_id}`);
    });
  }
  console.log('');

  // 5. Check students in scheduled sections
  console.log('📋 Step 5: Checking students in scheduled sections...');
  if (!schedules || schedules.length === 0) {
    console.log('⚠️  Skipping - No schedules to check\n');
  } else {
    const scheduledSectionIds = [...new Set(schedules.map(s => s.section_id))];
    console.log(`   Unique sections in schedules: ${scheduledSectionIds.length}`);

    let totalScheduleStudents = 0;
    for (const sectionId of scheduledSectionIds) {
      const { data: students, error: studentsError } = await supabase
        .from('section_students')
        .select('student_id, students(id, first_name, last_name, student_id)')
        .eq('section_id', sectionId);

      if (studentsError) {
        console.error(`   ❌ Error fetching students for section ${sectionId}:`, studentsError.message);
      } else if (!students || students.length === 0) {
        console.log(`   ⚠️  Section ${sectionId}: 0 students`);
      } else {
        console.log(`   ✅ Section ${sectionId}: ${students.length} student(s)`);
        totalScheduleStudents += students.length;
      }
    }
    console.log(`   TOTAL SCHEDULE STUDENTS (may have duplicates): ${totalScheduleStudents}\n`);
  }

  // 6. Check sections_with_details view
  console.log('📋 Step 6: Checking sections_with_details view...');
  const { data: viewSections, error: viewError } = await supabase
    .from('sections_with_details')
    .select('*')
    .eq('teacher_id', TEACHER_USER_ID);

  if (viewError) {
    console.error('❌ Error querying sections_with_details view:', viewError.message);
  } else if (!viewSections || viewSections.length === 0) {
    console.log('⚠️  NO SECTIONS found in sections_with_details view for this teacher');
  } else {
    console.log(`✅ Found ${viewSections.length} section(s) in view:`);
    viewSections.forEach((section, idx) => {
      console.log(`   ${idx + 1}. ${section.name} - Adviser: ${section.adviser_name || 'None'}`);
    });
  }
  console.log('');

  // 7. Check if view has teacher_id column
  console.log('📋 Step 7: Verifying view structure...');
  // Try to get view columns
  let viewColumns: any = null;
  try {
    const result = await supabase
      .rpc('get_view_columns', { view_name: 'sections_with_details' });
    viewColumns = result.data;
  } catch {
    // Fallback: try direct query
    const { data, error } = await supabase
      .from('sections_with_details')
      .select('*')
      .limit(1);

    if (data && data.length > 0) {
      viewColumns = Object.keys(data[0]);
    }
  }

  if (viewColumns) {
    const hasTeacherId = Array.isArray(viewColumns)
      ? viewColumns.includes('teacher_id')
      : Object.keys(viewColumns).includes('teacher_id');

    if (hasTeacherId) {
      console.log('✅ View has teacher_id column');
    } else {
      console.log('❌ View MISSING teacher_id column - THIS IS THE PROBLEM!');
    }
  }
  console.log('');

  // 8. Final Summary
  console.log('\n===========================================');
  console.log('📊 DIAGNOSTIC SUMMARY');
  console.log('===========================================\n');

  const hasAdvisory = advisorySections && advisorySections.length > 0;
  const hasSchedules = schedules && schedules.length > 0;

  if (!hasAdvisory && !hasSchedules) {
    console.log('🔴 RESULT: Zero students is CORRECT');
    console.log('   Reason: Teacher has NO advisory sections AND NO schedules assigned');
    console.log('');
    console.log('💡 SOLUTION: To see students, you need to:');
    console.log('   1. Assign sections to this teacher (set teacher_id in sections table), OR');
    console.log('   2. Create schedules for this teacher (insert into schedules table)');
    console.log('   3. Ensure those sections have students (entries in section_students table)');
  } else {
    console.log('🟡 RESULT: Needs further investigation');
    console.log(`   - Has advisory sections: ${hasAdvisory ? 'YES' : 'NO'}`);
    console.log(`   - Has schedules: ${hasSchedules ? 'YES' : 'NO'}`);
    console.log('');
    console.log('💡 NEXT STEPS:');
    console.log('   1. Check if sections have students in section_students table');
    console.log('   2. Verify frontend is correctly calling the API endpoints');
    console.log('   3. Check browser console for any API errors');
  }

  console.log('\n===========================================\n');
}

checkTeacherData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Script failed with error:', error);
    process.exit(1);
  });
