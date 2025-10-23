/**
 * Custom hook for sections management
 * 
 * Provides state management and API operations for sections.
 * Handles loading states, error handling, and data synchronization.
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  Section, 
  SectionWithDetails,
  CreateSectionRequest, 
  UpdateSectionRequest, 
  SectionsListParams,
  getSections,
  getSectionById,
  getSectionsByGradeLevel,
  getAvailableTeachers,
  createSection,
  updateSection,
  deleteSection,
} from '@/lib/api/endpoints/sections';

interface UseSectionsState {
  sections: SectionWithDetails[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

interface UseSectionsReturn extends UseSectionsState {
  // Data operations
  loadSections: (params?: SectionsListParams) => Promise<void>;
  loadSection: (id: string) => Promise<SectionWithDetails | null>;
  loadSectionsByGradeLevel: (gradeLevel: string) => Promise<SectionWithDetails[]>;
  loadAvailableTeachers: () => Promise<any[]>;
  addSection: (data: CreateSectionRequest) => Promise<Section | null>;
  updateSectionData: (id: string, data: UpdateSectionRequest) => Promise<Section | null>;
  removeSection: (id: string) => Promise<boolean>;
  
  // Utility operations
  refreshSections: () => Promise<void>;
  searchSections: (query: string) => Promise<void>;
  
  // State management
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useSections = (initialParams?: SectionsListParams): UseSectionsReturn => {
  const [state, setState] = useState<UseSectionsState>({
    sections: [],
    loading: false,
    error: null,
    pagination: null,
  });

  const [params, setParams] = useState<SectionsListParams | undefined>(initialParams);

  // Load sections with pagination and filtering
  const loadSections = useCallback(async (newParams?: SectionsListParams) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const searchParams = { ...params, ...newParams };
      setParams(searchParams);
      
      const response = await getSections(searchParams);
      
      setState(prev => ({
        ...prev,
        sections: response.data,
        pagination: response.pagination,
        loading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load sections',
      }));
    }
  }, [params]);

  // Load a single section
  const loadSection = useCallback(async (id: string): Promise<SectionWithDetails | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const section = await getSectionById(id);
      
      setState(prev => ({
        ...prev,
        loading: false,
      }));
      
      return section;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load section',
      }));
      return null;
    }
  }, []);

  // Load sections by grade level
  const loadSectionsByGradeLevel = useCallback(async (gradeLevel: string): Promise<SectionWithDetails[]> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const sections = await getSectionsByGradeLevel(gradeLevel);
      
      setState(prev => ({
        ...prev,
        loading: false,
      }));
      
      return sections;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load sections for grade level',
      }));
      return [];
    }
  }, []);

  // Load available teachers
  const loadAvailableTeachers = useCallback(async (): Promise<any[]> => {
    try {
      console.log('useSections: Loading available teachers...');
      const teachers = await getAvailableTeachers();
      console.log('useSections: Available teachers loaded:', teachers);
      return teachers;
    } catch (error: any) {
      console.error('useSections: Error loading available teachers:', error);
      setState(prev => ({
        ...prev,
        error: error?.message || 'Failed to load available teachers',
      }));
      return [];
    }
  }, []);

  // Add a new section
  const addSection = useCallback(async (data: CreateSectionRequest): Promise<Section | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const newSection = await createSection(data);
      
      setState(prev => ({
        ...prev,
        sections: [newSection as SectionWithDetails, ...prev.sections],
        loading: false,
      }));
      
      return newSection;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to create section',
      }));
      return null;
    }
  }, []);

  // Update an existing section
  const updateSectionData = useCallback(async (id: string, data: UpdateSectionRequest): Promise<Section | null> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const updatedSection = await updateSection(id, data);
      
      setState(prev => ({
        ...prev,
        sections: prev.sections.map(section => 
          section.id === id ? updatedSection as SectionWithDetails : section
        ),
        loading: false,
      }));
      
      return updatedSection;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to update section',
      }));
      return null;
    }
  }, []);

  // Delete a section
  const removeSection = useCallback(async (id: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      await deleteSection(id);
      
      setState(prev => ({
        ...prev,
        sections: prev.sections.filter(section => section.id !== id),
        loading: false,
      }));
      
      return true;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to delete section',
      }));
      return false;
    }
  }, []);

  // Refresh sections list
  const refreshSections = useCallback(async () => {
    await loadSections(params);
  }, [loadSections, params]);

  // Search sections
  const searchSections = useCallback(async (query: string) => {
    await loadSections({ ...params, search: query });
  }, [loadSections, params]);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Set loading state
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  // Load sections on mount if initial params provided
  useEffect(() => {
    if (initialParams) {
      loadSections(initialParams);
    }
  }, []); // Only run on mount

  return {
    ...state,
    loadSections,
    loadSection,
    loadSectionsByGradeLevel,
    loadAvailableTeachers,
    addSection,
    updateSectionData,
    removeSection,
    refreshSections,
    searchSections,
    clearError,
    setLoading,
  };
};
