/**
 * API Endpoints Index
 * Centralized exports for all API endpoints
 */

export * from './auth';
export * from './announcements';
export * from './events';
export * from './academic-calendar';
export * from './student-rankings';
export * from './emergency-contacts';
export * from './schedules';
export * from './quiz';
export * from './question-bank';
export * from './users';
export * from './gallery';
export * from './sections';

// Export clubs functions (avoiding conflicts with club-forms)
export {
  getAvailableClubs,
  getStudentClubs,
  joinClub,
  getClubs,
  getClubById,
  createClub,
  updateClub,
  deleteClub,
  getClubsByDomain,
  searchClubs,
  getClubBySlug,
  getClubsForDisplay,
  getFeaturedClubs,
  getClubPositions,
  addClubMember,
  addClubMembersBulk,
  updateClubMembership,
  removeClubMember,
  getAllClubMemberships,
  getClubsWithMemberCounts,
  getClubAnnouncements,
  getClubAnnouncementById,
  createClubAnnouncement,
  updateClubAnnouncement,
  deleteClubAnnouncement,
  getClubFormResponsesByFormId,
  reviewClubFormResponse,
  approveClubApplication,
  rejectClubApplication,
  generateClubSlug,
  // Club form functions from clubs.ts (these are the main ones)
  getClubForms,
  getClubFormById as getClubFormByIdFromClubs,
  createClubForm,
  submitClubFormResponse,
  getClubFormResponses,
  updateClubFormResponseStatus,
  getActiveClubForms,
  getUserClubFormResponses,
} from './clubs';

// Export club-forms specific functions (renamed to avoid conflicts)
export {
  getClubFormsByClub,
  getClubFormById,
  createClubFormForClub,
  updateClubForm,
  deleteClubForm,
  addFormQuestion,
  updateFormQuestion,
  deleteFormQuestion,
  getFormResponses,
  getFormResponse,
  submitFormResponse,
  reviewFormResponse,
  mapQuestionTypeToUI,
  mapUITypeToBackend,
  getResponseStatusColor,
  // Types and enums
  FormType,
  QuestionType,
  ResponseStatus,
  type ClubForm,
  type FormQuestion,
  type QuestionOption,
  type FormResponse,
  type FormAnswer,
  type CreateClubFormDto,
  type UpdateClubFormDto,
  type CreateFormQuestionDto,
  type UpdateFormQuestionDto,
  type SubmitFormResponseDto,
  type ReviewFormResponseDto,
} from './club-forms';

// Export only count functions and types from entities (avoid conflicts)
export type {
  EntityCountResponse,
  AllEntityCounts,
  Department,
  DepartmentFilters,
  Section,
  SectionFilters,
} from './entities';

export {
  getDepartments,
  getDepartmentCount,
  getClubCount,
  getSections,
  getSectionCount,
  getModules,
  getModuleCount,
  getEventCount,
  getAllEntityCounts,
} from './entities';
