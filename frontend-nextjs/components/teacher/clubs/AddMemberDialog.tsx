'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2, Users, UserPlus } from 'lucide-react';
import { useStudentSearch, useClubPositions, useClubMembershipMutations } from '@/hooks';
import type { ClubMembership } from '@/hooks/useClubMemberships';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clubId: string;
  currentMembers: ClubMembership[];
}

export function AddMemberDialog({
  open,
  onOpenChange,
  clubId,
  currentMembers,
}: AddMemberDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [studentPositions, setStudentPositions] = useState<Record<string, string>>({});

  const { data: students, isLoading: loadingStudents, updateSearch } = useStudentSearch();
  const { data: positions = [], isLoading: loadingPositions } = useClubPositions();
  const { addMember, addMembersBulk } = useClubMembershipMutations(clubId);

  // Get default "Member" position
  const defaultPosition = useMemo(
    () => positions.find((p) => p.name.toLowerCase() === 'member'),
    [positions]
  );

  // Check if student is already in THIS club
  const isAlreadyMember = (studentId: string) => {
    return currentMembers.some((m) => m.student_id === studentId);
  };

  // Handle search input
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    updateSearch(value);
  };

  // Handle position change for a student
  const handlePositionChange = (studentId: string, positionId: string) => {
    setStudentPositions((prev) => ({ ...prev, [studentId]: positionId }));
  };

  // Handle single add
  const handleAddSingle = async (studentId: string) => {
    const positionId = studentPositions[studentId] || defaultPosition?.id;
    if (!positionId) return;

    await addMember.mutateAsync({
      studentId,
      clubId,
      positionId,
      isActive: true,
    });

    // Clear selection
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      next.delete(studentId);
      return next;
    });
  };

  // Handle bulk add
  const handleAddBulk = async () => {
    const membersToAdd = Array.from(selectedStudents).map((studentId) => ({
      studentId,
      clubId,
      positionId: studentPositions[studentId] || defaultPosition?.id!,
      isActive: true,
    }));

    await addMembersBulk.mutateAsync(membersToAdd);

    // Clear selections
    setSelectedStudents(new Set());
    setStudentPositions({});
  };

  // Toggle student selection
  const toggleStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });

    // Set default position if not set
    if (!studentPositions[studentId] && defaultPosition) {
      handlePositionChange(studentId, defaultPosition.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col dark:bg-gray-900 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">Add Members to Club</DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Search for students and add them to your club
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search students by name or student ID..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        {/* Selected Count */}
        {selectedStudents.size > 0 && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-800">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedStudents.size} student{selectedStudents.size !== 1 ? 's' : ''} selected
            </span>
            <Button
              size="sm"
              onClick={handleAddBulk}
              disabled={addMembersBulk.isPending}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {addMembersBulk.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Selected
                </>
              )}
            </Button>
          </div>
        )}

        {/* Student List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {loadingStudents ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          ) : students?.data.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No students found</p>
            </div>
          ) : (
            students?.data.map((student) => {
              const alreadyMember = isAlreadyMember(student.id);
              const isSelected = selectedStudents.has(student.id);

              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    alreadyMember
                      ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/30 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {/* Checkbox */}
                  {!alreadyMember && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                  )}

                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium dark:text-gray-100">
                        {student.first_name} {student.last_name}
                      </p>
                      {alreadyMember && (
                        <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                          Already Member
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {student.student_id} • {student.grade_level || 'N/A'} • {student.sections?.name || 'No Section'}
                    </p>
                  </div>

                  {/* Position Selector */}
                  {!alreadyMember && (
                    <Select
                      value={studentPositions[student.id] || defaultPosition?.id}
                      onValueChange={(value) => handlePositionChange(student.id, value)}
                      disabled={loadingPositions}
                    >
                      <SelectTrigger className="w-32 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100">
                        <SelectValue placeholder="Position" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                        {positions.map((position) => (
                          <SelectItem
                            key={position.id}
                            value={position.id}
                            className="dark:text-gray-100 dark:hover:bg-gray-700"
                          >
                            {position.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Add Button */}
                  {!alreadyMember && !isSelected && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddSingle(student.id)}
                      disabled={addMember.isPending || !studentPositions[student.id] && !defaultPosition}
                      className="dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700"
                    >
                      {addMember.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Add'
                      )}
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination (if needed) */}
        {students && students.pagination.totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {students.pagination.page} of {students.pagination.totalPages}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
