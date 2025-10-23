'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Medal, Award, Star, Users, TrendingUp } from 'lucide-react';
import { getStudentRankings, getTopStudentsByGwa } from '@/lib/api/endpoints/student-rankings';
import { StudentRanking, GwaRecord } from '@/lib/api/types/student-rankings';

interface StudentRankingsOptimizedProps {
  className?: string;
}

const gradeLevels = [
  { value: 'all', label: 'All Grades' },
  { value: 'Grade 7', label: 'Grade 7' },
  { value: 'Grade 8', label: 'Grade 8' },
  { value: 'Grade 9', label: 'Grade 9' },
  { value: 'Grade 10', label: 'Grade 10' },
];

const quarters = [
  { value: 'all', label: 'All Quarters' },
  { value: 'Q1', label: '1st Quarter' },
  { value: 'Q2', label: '2nd Quarter' },
  { value: 'Q3', label: '3rd Quarter' },
  { value: 'Q4', label: '4th Quarter' },
];

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-600" />;
    default:
      return <Star className="h-4 w-4 text-blue-500" />;
  }
};

const getHonorBadgeVariant = (honorStatus: string) => {
  if (honorStatus.includes('Highest')) return 'default';
  if (honorStatus.includes('High')) return 'secondary';
  return 'outline';
};

const getHonorBadgeColor = (honorStatus: string) => {
  if (honorStatus.includes('Highest')) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
  if (honorStatus.includes('High')) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
  return 'bg-gray-100 text-gray-700';
};

export function StudentRankingsOptimized({ className }: StudentRankingsOptimizedProps) {
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [viewMode, setViewMode] = useState<'rankings' | 'gwa'>('rankings');

  // Memoized query parameters to prevent unnecessary re-renders
  const rankingsParams = useMemo(() => ({
    page: 1,
    limit: 50,
    gradeLevel: selectedGrade === 'all' ? undefined : selectedGrade,
    quarter: selectedQuarter === 'all' ? undefined : selectedQuarter,
    schoolYear: '2024-2025',
    topN: 50,
  }), [selectedGrade, selectedQuarter]);

  const gwaParams = useMemo(() => ({
    gradeLevel: selectedGrade === 'all' ? undefined : selectedGrade,
    quarter: selectedQuarter === 'all' ? undefined : selectedQuarter,
    schoolYear: '2024-2025',
    limit: 50,
  }), [selectedGrade, selectedQuarter]);

  // React Query with optimized caching
  const {
    data: rankingsData,
    isLoading: rankingsLoading,
    error: rankingsError,
    isStale: rankingsStale,
  } = useQuery({
    queryKey: ['student-rankings', rankingsParams],
    queryFn: () => getStudentRankings(rankingsParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const {
    data: gwaData,
    isLoading: gwaLoading,
    error: gwaError,
  } = useQuery({
    queryKey: ['top-gwa', gwaParams],
    queryFn: () => getTopStudentsByGwa(gwaParams),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: viewMode === 'gwa', // Only fetch when needed
  });

  // Memoized filtered data
  const displayData = useMemo(() => {
    if (viewMode === 'rankings') {
      return rankingsData?.data || [];
    } else {
      return gwaData || [];
    }
  }, [viewMode, rankingsData, gwaData]);

  // Memoized statistics
  const stats = useMemo(() => {
    if (viewMode === 'rankings') {
      const data = rankingsData?.data || [];
      const totalStudents = data.length;
      const highestHonors = data.filter(s => s.honor_status?.includes('Highest')).length;
      const highHonors = data.filter(s => s.honor_status?.includes('High')).length;
      
      return { totalStudents, highestHonors, highHonors };
    } else {
      const data = gwaData || [];
      const totalStudents = data.length;
      const avgGwa = data.length > 0 
        ? (data.reduce((sum, s) => sum + parseFloat(s.gwa), 0) / data.length).toFixed(2)
        : '0.00';
      const topGwa = data.length > 0 ? parseFloat(data[0]?.gwa || '0').toFixed(2) : '0.00';
      
      return { totalStudents, avgGwa, topGwa };
    }
  }, [viewMode, rankingsData, gwaData]);

  const isLoading = viewMode === 'rankings' ? rankingsLoading : gwaLoading;
  const error = viewMode === 'rankings' ? rankingsError : gwaError;

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load student data</p>
            <p className="text-sm text-gray-500 mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Header with Statistics */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Student Leaderboard
              {rankingsStale && (
                <Badge variant="outline" className="text-xs">
                  Stale
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'rankings' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('rankings')}
              >
                <Trophy className="h-4 w-4 mr-1" />
                Rankings
              </Button>
              <Button
                variant={viewMode === 'gwa' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('gwa')}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                GWA
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
              </div>
            </div>
            
            {viewMode === 'rankings' ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Trophy className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Highest Honors</p>
                    <p className="text-2xl font-bold">{stats.highestHonors}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Award className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">High Honors</p>
                    <p className="text-2xl font-bold">{stats.highHonors}</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average GWA</p>
                    <p className="text-2xl font-bold">{stats.avgGwa}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Star className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Top GWA</p>
                    <p className="text-2xl font-bold">{stats.topGwa}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Grade Level</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map((grade) => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Quarter</label>
              <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {quarters.map((quarter) => (
                    <SelectItem key={quarter.value} value={quarter.value}>
                      {quarter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {viewMode === 'rankings' ? (
              <>
                <Trophy className="h-5 w-5 text-yellow-500" />
                Student Rankings
              </>
            ) : (
              <>
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Top GWA Students
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-48 mb-2" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          ) : displayData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No student data available</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayData.map((student, index) => (
                <div
                  key={student.id || index}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {viewMode === 'rankings' ? (
                      getRankIcon((student as StudentRanking).rank)
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <span className="text-sm font-bold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        {student.student?.first_name} {student.student?.last_name}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {student.student?.student_id}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {student.student?.grade_level}
                      {viewMode === 'rankings' && (student as StudentRanking).quarter && (
                        <span className="ml-2">• {(student as StudentRanking).quarter}</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    {viewMode === 'rankings' ? (
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          variant={getHonorBadgeVariant((student as StudentRanking).honor_status)}
                          className={getHonorBadgeColor((student as StudentRanking).honor_status)}
                        >
                          {(student as StudentRanking).honor_status}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          Rank #{(student as StudentRanking).rank}
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-2xl font-bold text-blue-600">
                          {(student as GwaRecord).gwa}
                        </span>
                        <Badge
                          variant={getHonorBadgeVariant((student as GwaRecord).honor_status)}
                          className={getHonorBadgeColor((student as GwaRecord).honor_status)}
                        >
                          {(student as GwaRecord).honor_status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
