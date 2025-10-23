/**
 * Custom hook for subjects management
 * 
 * Provides state management and API operations for subjects.
 * Handles loading states, error handling, and data synchronization.
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  Subject, 
  CreateSubjectRequest, 
  UpdateSubjectRequest, 
  SubjectsListParams,
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectStats,
  checkSubjectCodeExists
} from '@/lib/api/endpoints/subjects';

interface UseSubjectsState {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

interface UseSubjectsReturn extends UseSubjectsState {
  // Data operations
  loadSubjects: (params?: SubjectsListParams) => Promise<void>;
  loadSubject: (id: string) => Promise<Subject | null>;
  addSubject: (data: CreateSubjectRequest) => Promise<Subject | null>;
  updateSubjectData: (id: string, data: UpdateSubjectRequest) => Promise<Subject | null>;
  removeSubject: (id: string) => Promise<boolean>;
  
  // Utility operations
  refreshSubjects: () => Promise<void>;
  searchSubjects: (query: string) => Promise<void>;
  getStats: () => Promise<any>;
  checkCodeExists: (code: string, excludeId?: string) => Promise<boolean>;
  
  // State management
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useSubjects = (initialParams?: SubjectsListParams): UseSubjectsReturn => {
  const [state, setState] = useState<UseSubjectsState>({
    subjects: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const [params, setParams] = useState<SubjectsListParams | undefined>(initialParams);

  // Load subjects with pagination and filtering
  const loadSubjects = useCallback(async (newParams?: SubjectsListParams) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const searchParams = { ...params, ...newParams };
      setParams(searchParams);
      
      const response = await getSubjects(searchParams);
      
      setState(prev => ({
        ...prev,
        subjects: response.data,
        pagination: response.pagination,
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load subjects',
      }));
    }
  }, [params]);

  // Load a single subject
  const loadSubject = useCallback(async (id: string): Promise<Subject | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const subject = await getSubject(id);
      
      setState(prev => ({
        ...prev,
        loading: false,
      }));
      
      return subject;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load subject',
      }));
      return null;
    }
  }, []);

  // Add a new subject
  const addSubject = useCallback(async (data: CreateSubjectRequest): Promise<Subject | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const newSubject = await createSubject(data);
      
      setState(prev => ({
        ...prev,
        subjects: [newSubject, ...prev.subjects],
        loading: false,
      }));
      
      return newSubject;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to create subject',
      }));
      return null;
    }
  }, []);

  // Update an existing subject
  const updateSubjectData = useCallback(async (id: string, data: UpdateSubjectRequest): Promise<Subject | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedSubject = await updateSubject(id, data);
      
      setState(prev => ({
        ...prev,
        subjects: prev.subjects.map(subject => 
          subject.id === id ? updatedSubject : subject
        ),
        loading: false,
      }));
      
      return updatedSubject;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to update subject',
      }));
      return null;
    }
  }, []);

  // Delete a subject
  const removeSubject = useCallback(async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await deleteSubject(id);
      
      setState(prev => ({
        ...prev,
        subjects: prev.subjects.filter(subject => subject.id !== id),
        loading: false,
      }));
      
      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to delete subject',
      }));
      return false;
    }
  }, []);

  // Refresh subjects list
  const refreshSubjects = useCallback(async () => {
    await loadSubjects(params);
  }, [loadSubjects, params]);

  // Search subjects
  const searchSubjects = useCallback(async (query: string) => {
    await loadSubjects({ ...params, search: query });
  }, [loadSubjects, params]);

  // Get statistics
  const getStats = useCallback(async () => {
    try {
      return await getSubjectStats();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error?.message || 'Failed to load statistics',
      }));
      return null;
    }
  }, []);

  // Check if subject code exists
  const checkCodeExists = useCallback(async (code: string, excludeId?: string): Promise<boolean> => {
    try {
      return await checkSubjectCodeExists(code, excludeId);
    } catch {
      return false;
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  // Load subjects on mount if initial params provided
  useEffect(() => {
    if (initialParams) {
      loadSubjects(initialParams);
    }
  }, []); // Only run on mount

  return {
    ...state,
    loadSubjects,
    loadSubject,
    addSubject,
    updateSubjectData,
    removeSubject,
    refreshSubjects,
    searchSubjects,
    getStats,
    checkCodeExists,
    clearError,
    setLoading,
  };
};








