import { NextResponse } from 'next/server';

export async function GET() {
  const results: any = {};
  let successCount = 0;
  const totalTests = 3;

  try {
    // Test 1: Get student rankings (should be public)
    const rankingsResponse = await fetch('http://localhost:3004/api/v1/public/students/rankings?limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (rankingsResponse.ok) {
      const rankingsData = await rankingsResponse.json();
      results.studentRankings = {
        success: true,
        message: `Successfully fetched ${rankingsData.data?.length || 0} student rankings without authentication`,
        status: rankingsResponse.status,
        data: rankingsData.data?.slice(0, 3).map((r: any) => ({
          id: r.id,
          student_name: `${r.student?.first_name} ${r.student?.last_name}`,
          rank: r.rank,
          grade_level: r.grade_level,
        })) || [],
      };
      successCount++;
    } else {
      results.studentRankings = {
        success: false,
        error: `HTTP ${rankingsResponse.status}: ${rankingsResponse.statusText}`,
        status: rankingsResponse.status,
      };
    }
  } catch (error: any) {
    results.studentRankings = {
      success: false,
      error: error.message,
      note: 'Backend might not be running'
    };
  }

  try {
    // Test 2: Get top students by GWA (should be public)
    const gwaResponse = await fetch('http://localhost:3004/api/v1/public/gwa/top?limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (gwaResponse.ok) {
      const gwaData = await gwaResponse.json();
      results.topGwaStudents = {
        success: true,
        message: `Successfully fetched ${gwaData.length || 0} top GWA students without authentication`,
        status: gwaResponse.status,
        data: gwaData.slice(0, 3).map((s: any) => ({
          student_name: `${s.student?.first_name} ${s.student?.last_name}`,
          gwa: s.gwa,
          grade_level: s.student?.grade_level,
        })) || [],
      };
      successCount++;
    } else {
      results.topGwaStudents = {
        success: false,
        error: `HTTP ${gwaResponse.status}: ${gwaResponse.statusText}`,
        status: gwaResponse.status,
      };
    }
  } catch (error: any) {
    results.topGwaStudents = {
      success: false,
      error: error.message,
      note: 'Backend might not be running'
    };
  }

  try {
    // Test 3: Test with no auth headers (should still work)
    const noAuthResponse = await fetch('http://localhost:3004/api/v1/public/students/rankings?limit=1', {
      method: 'GET',
      // Intentionally no headers to test public access
    });

    if (noAuthResponse.ok) {
      results.noAuthTest = {
        success: true,
        message: 'Successfully accessed rankings endpoint without any authentication headers',
        status: noAuthResponse.status,
      };
      successCount++;
    } else {
      results.noAuthTest = {
        success: false,
        error: `HTTP ${noAuthResponse.status}: ${noAuthResponse.statusText}`,
        status: noAuthResponse.status,
      };
    }
  } catch (error: any) {
    results.noAuthTest = {
      success: false,
      error: error.message,
      note: 'Backend might not be running'
    };
  }

  return NextResponse.json({
    success: successCount === totalTests,
    message: `Public rankings API tests completed: ${successCount}/${totalTests} tests passed`,
    timestamp: new Date().toISOString(),
    results,
    note: "These endpoints should work without any authentication tokens"
  });
}
