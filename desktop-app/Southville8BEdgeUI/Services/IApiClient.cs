using System;
using System.Collections.Generic;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.Services;

public interface IApiClient
{
    Task<T?> GetAsync<T>(string endpoint) where T : class;
    Task<T?> PostAsync<T>(string endpoint, object? data = null) where T : class;
    Task<T?> PutAsync<T>(string endpoint, object? data = null) where T : class;
    Task<T?> PatchAsync<T>(string endpoint, object? data = null) where T : class;
    Task<T?> DeleteAsync<T>(string endpoint) where T : class;
    Task<bool> PostAsync(string endpoint, object? data = null);
    Task<bool> PutAsync(string endpoint, object? data = null);
    Task<bool> PatchAsync(string endpoint, object? data = null);
    Task<bool> DeleteAsync(string endpoint);
    Task<UserProfile?> GetUserProfileAsync(string userId);
    Task<UserProfile?> GetUserProfileAsync(string userId, string accessToken);
    Task<AdminDashboardMetrics?> GetAdminDashboardMetricsAsync();
    
    // User Management Methods
    Task<UserListResponse?> GetUsersAsync(string? role = null, string? status = null, int page = 1, int limit = 25);
    Task<CreateUserResponse?> CreateStudentAsync(CreateStudentDto dto);
    Task<CreateUserResponse?> CreateTeacherAsync(CreateTeacherDto dto);
    Task<CreateUserResponse?> CreateAdminAsync(CreateAdminDto dto);
    Task<bool> UpdateUserStatusAsync(string userId, string status);
    Task<bool> DeleteUserAsync(string userId);
    Task<BulkImportResultDto?> ImportStudentsCsvAsync(ImportStudentsCsvDto dto);
    Task<ResetPasswordResponseDto?> ResetPasswordAsync(string userId);
    Task<ChangePasswordResponseDto?> ChangePasswordAsync(string currentPassword, string newPassword);
    
    // Section Management Methods
    Task<SectionListResponse?> GetSectionsAsync(int limit = 100);

    // Student distribution stats
    Task<StudentDistributionDto?> GetStudentDistributionAsync();
    
    // Building Management Methods
    Task<BuildingListResponse?> GetBuildingsAsync(int limit = 100);
    Task<BuildingDto?> GetBuildingByIdAsync(string id);
    Task<BuildingDto?> CreateBuildingAsync(CreateBuildingDto dto);
    Task<BuildingDto?> UpdateBuildingAsync(string id, UpdateBuildingDto dto);
    Task<bool> DeleteBuildingAsync(string id);
    
    // Floor Management Methods
    Task<FloorListResponse?> GetFloorsAsync(string? buildingId = null, int limit = 100);
    Task<FloorDto?> GetFloorByIdAsync(string id);
    Task<FloorDto?> CreateFloorAsync(CreateFloorDto dto);
    Task<FloorDto?> UpdateFloorAsync(string id, UpdateFloorDto dto);
    Task<bool> DeleteFloorAsync(string id);
    
    // Room Management Methods
    Task<RoomListResponse?> GetRoomsAsync(string? floorId = null, string? buildingId = null, string? status = null, int limit = 100);
    Task<RoomDto?> GetRoomByIdAsync(string id);
    Task<RoomDto?> CreateRoomAsync(CreateRoomDto dto);
    Task<List<RoomDto>?> CreateRoomsBulkAsync(List<CreateRoomDto> rooms);
    Task<RoomDto?> UpdateRoomAsync(string id, UpdateRoomDto dto);
    Task<bool> DeleteRoomAsync(string id);
    
    // Department Management Methods
    Task<DepartmentsResponse?> GetDepartmentsAsync(int page = 1, int limit = 100);
    
    // Subject Management Methods
    Task<SubjectsResponse?> GetSubjectsByDepartmentAsync(string departmentId, int page = 1, int limit = 100);
    
    // Event Management Methods
    Task<EventListResponse?> GetEventsAsync(int page = 1, int limit = 10, string? status = null, string? search = null, string? tagId = null);
    Task<EventStatisticsDto?> GetEventStatisticsAsync();
    Task<List<TagDto>?> GetEventTagsAsync();
    Task<EventDto?> GetEventByIdAsync(string id);
    Task<EventDto?> CreateEventAsync(CreateEventDto dto);
    Task<EventDto?> UpdateEventAsync(string id, UpdateEventDto dto);
    Task<bool> DeleteEventAsync(string id);
    
    // Event FAQ Management Methods
    Task<EventFaqDto?> AddEventFaqAsync(string eventId, CreateEventFaqDto dto);
    Task<EventFaqDto?> UpdateEventFaqAsync(string eventId, string faqId, UpdateEventFaqDto dto);
    Task DeleteEventFaqAsync(string eventId, string faqId);
    
    // Event Image Upload
    Task<string?> UploadEventImageAsync(string filePath);
    
    void SetAccessToken(string accessToken);
    string? GetCurrentUserId();
    string? GetCachedToken();

    // Alerts API
    Task<AlertListResponse?> GetAlertsAsync(int page = 1, int limit = 50);
    Task<AlertDto?> CreateAlertAsync(CreateAlertDto dto);
    Task<AlertDto?> UpdateAlertAsync(string id, UpdateAlertDto dto);
    Task<bool> DeleteAlertAsync(string id);

    // Teacher-specific API methods
    Task<TeacherSidebarMetrics?> GetTeacherMetricsAsync(string teacherId);
    Task<List<ScheduleDto>?> GetTeacherTodaySchedulesAsync(string teacherId);
    Task<List<TeacherActivityDto>?> GetTeacherRecentActivitiesAsync(string teacherId);
    
    // GWA Management Methods
    Task<StudentGwaListResponse?> GetAdvisoryStudentsWithGwaAsync(string gradingPeriod, string schoolYear);
    Task<StudentGwaDto?> CreateGwaEntryAsync(CreateGwaDto dto);
    Task<StudentGwaDto?> UpdateGwaEntryAsync(string id, UpdateGwaDto dto);
    Task<bool> DeleteGwaEntryAsync(string id);
    
    // Schedule Management Methods
    Task<ScheduleListResponse?> GetSchedulesAsync(int page = 1, int limit = 20, string? sectionId = null, string? teacherId = null, string? dayOfWeek = null, string? schoolYear = null, string? semester = null);
    Task<ScheduleDto?> GetScheduleByIdAsync(string scheduleId);
    Task<ScheduleDto?> CreateScheduleAsync(CreateScheduleDto dto);
    Task<ScheduleDto?> UpdateScheduleAsync(string scheduleId, UpdateScheduleDto dto);
    Task<bool> DeleteScheduleAsync(string scheduleId);
    
    // Bulk operations
    Task<List<ScheduleDto>?> BulkCreateSchedulesAsync(List<CreateScheduleDto> schedules);
    
    // Student assignment
    Task<bool> AssignStudentsToScheduleAsync(string scheduleId, AssignStudentsDto dto);
    Task<bool> RemoveStudentsFromScheduleAsync(string scheduleId, List<string> studentIds);
    
    // Conflict checking
    Task<ConflictCheckResult?> CheckScheduleConflictsAsync(CreateScheduleDto dto);
    
    // Dropdown data for schedules
    Task<List<Subject>?> GetSubjectsAsync();
    Task<List<SectionDto>?> GetSectionsAsync();
    Task<List<UserDto>?> GetTeachersAsync();
    Task<List<RoomDto>?> GetRoomsAsync();
    Task<List<BuildingDto>?> GetBuildingsAsync();
    
    // Announcement Management Methods
    Task<AnnouncementListResponse?> GetAnnouncementsAsync(
        string? teacherId = null,
        string? sectionId = null,
        string? visibility = null,
        string? type = null,
        bool? includeExpired = null,
        int page = 1,
        int limit = 100);
    
    Task<AnnouncementDto?> GetAnnouncementByIdAsync(string id);
    Task<AnnouncementDto?> CreateAnnouncementAsync(CreateAnnouncementDto dto);
    Task<AnnouncementDto?> UpdateAnnouncementAsync(string id, UpdateAnnouncementDto dto);
    Task DeleteAnnouncementAsync(string id);
    Task<AnnouncementStatsDto?> GetAnnouncementStatsAsync(string teacherId);
    Task<List<SectionDto>?> GetMySectionsAsync();
    
    // Related entity methods
    Task<DepartmentDto?> GetDepartmentAsync(string departmentId);
    Task<SubjectDto?> GetSubjectAsync(string subjectId);
    Task<SectionDto?> GetSectionAsync(string sectionId);
}
