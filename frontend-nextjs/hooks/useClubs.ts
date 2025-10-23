'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAvailableClubs, getStudentClubs, joinClub, type ClubsListResponse, type StudentClubMembership } from '@/lib/api/endpoints/clubs'

export function useAvailableClubs(options: { page?: number; limit?: number; search?: string; category?: string } = {}) {
  const { page = 1, limit = 12, search, category } = options
  return useQuery<ClubsListResponse, Error>({
    queryKey: ['clubs','available', { page, limit, search, category }],
    queryFn: () => getAvailableClubs({ page, limit, search, category }),
    placeholderData: (previousData) => previousData,
    staleTime: 2 * 60 * 1000,
  })
}

export function useStudentClubs(studentId?: string) {
  return useQuery<StudentClubMembership[], Error>({
    queryKey: ['clubs','student', studentId],
    queryFn: () => getStudentClubs(studentId as string),
    enabled: Boolean(studentId),
    staleTime: 5 * 60 * 1000,
  })
}

export function useJoinClub() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (clubId: string) => joinClub(clubId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clubs'] })
    }
  })
}


