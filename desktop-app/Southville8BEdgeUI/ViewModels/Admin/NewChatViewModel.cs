using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class NewChatViewModel : ViewModelBase
{
    private readonly IChatService _chatService;
    private readonly IApiClient _apiClient;
    private readonly string _currentUserId;

    public Action? NavigateBack { get; set; }
    public Action<ChatCreationResult>? OnCreated { get; set; }

    [ObservableProperty] private string _chatName = string.Empty;
    [ObservableProperty] private string _description = string.Empty;
    [ObservableProperty] private bool _isPublic = true;
    [ObservableProperty] private bool _allowInvites = true;

    [ObservableProperty] private string _chatImagePath = string.Empty; // file path
    [ObservableProperty] private string _participantSearch = string.Empty;
    [ObservableProperty] private UserOption? _selectedAvailableUser;
    [ObservableProperty] private bool _isLoadingUsers;

    public ObservableCollection<UserOption> AllUsers { get; } = new();
    public ObservableCollection<UserOption> FilteredAvailableUsers { get; } = new();
    public ObservableCollection<UserOption> SelectedParticipants { get; } = new();

    public bool HasImage => !string.IsNullOrWhiteSpace(ChatImagePath);

    public string? BasicValidationMessage => string.IsNullOrWhiteSpace(ChatName) ? "Chat name is required." : null;
    public string? ParticipantsValidationMessage => SelectedParticipants.Count == 0 ? "At least one participant is required." : null;

    // Cached image validation message to avoid repeated File.Exists calls on UI thread
    private string? _imageValidationMessage;
    public string? ImageValidationMessage => _imageValidationMessage;

    // Boolean helpers for XAML IsVisible bindings
    public bool IsBasicValidationVisible => BasicValidationMessage is not null;
    public bool IsParticipantsValidationVisible => ParticipantsValidationMessage is not null;
    public bool IsImageValidationVisible => ImageValidationMessage is not null;

    public bool HasSelectedAvailableUser => SelectedAvailableUser is not null;

    public bool CanCreate => BasicValidationMessage is null &&
                              ParticipantsValidationMessage is null &&
                              ImageValidationMessage is null;

    public NewChatViewModel()
    {
        // Mock user list (would come from a service)
        string[] names =
        {
            "Maria Rodriguez","Robert Wilson","Dr. Michael Brown","Jennifer Taylor","Catherine Martinez","Alex Johnson","Emily Davis","Daniel Lee","Sophia Clark","Liam Harris"
        };
        foreach (var n in names)
            AllUsers.Add(new UserOption { Name = n, UserId = Guid.NewGuid().ToString() });
        RefreshFiltered();
    }

    public NewChatViewModel(IChatService chatService, IApiClient apiClient, string currentUserId)
    {
        _chatService = chatService;
        _apiClient = apiClient;
        _currentUserId = currentUserId;
        _ = LoadUsersAsync();
    }

    private async Task LoadUsersAsync()
    {
        try
        {
            IsLoadingUsers = true;
            
            // Load Admins and Teachers (exclude current user)
            var adminResponse = await _apiClient.GetUsersAsync(role: "Admin", limit: 100);
            var teacherResponse = await _apiClient.GetUsersAsync(role: "Teacher", limit: 100);
            
            AllUsers.Clear();
            
            if (adminResponse?.Users != null)
            {
                foreach (var user in adminResponse.Users.Where(u => u.Id != _currentUserId))
                {
                    AllUsers.Add(new UserOption
                    {
                        UserId = user.Id,
                        Name = user.FullName ?? user.Email,
                        Role = user.Role ?? "Admin"
                    });
                }
            }
            
            if (teacherResponse?.Users != null)
            {
                foreach (var user in teacherResponse.Users.Where(u => u.Id != _currentUserId))
                {
                    AllUsers.Add(new UserOption
                    {
                        UserId = user.Id,
                        Name = user.FullName ?? user.Email,
                        Role = user.Role ?? "Teacher"
                    });
                }
            }
            
            RefreshFiltered();
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[NewChatViewModel] Error loading users: {ex.Message}");
        }
        finally
        {
            IsLoadingUsers = false;
        }
    }

    partial void OnChatNameChanged(string value)
    {
        OnPropertyChanged(nameof(BasicValidationMessage));
        OnPropertyChanged(nameof(IsBasicValidationVisible));
        OnPropertyChanged(nameof(CanCreate));
    }
    partial void OnParticipantSearchChanged(string value) => RefreshFiltered();
    partial void OnChatImagePathChanged(string value)
    {
        RecalculateImageValidation();
        OnPropertyChanged(nameof(HasImage));
        OnPropertyChanged(nameof(ImageValidationMessage));
        OnPropertyChanged(nameof(IsImageValidationVisible));
        OnPropertyChanged(nameof(CanCreate));
    }
    partial void OnSelectedAvailableUserChanged(UserOption? value)
    {
        OnPropertyChanged(nameof(HasSelectedAvailableUser));
    }

    private void RecalculateImageValidation()
    {
        if (!HasImage)
        {
            _imageValidationMessage = null;
            return;
        }
        // Perform File.Exists once per change, catch possible path format issues
        try
        {
            _imageValidationMessage = File.Exists(ChatImagePath) ? null : "Image file not found.";
        }
        catch
        {
            _imageValidationMessage = "Invalid image path.";
        }
    }

    private void RefreshFiltered()
    {
        FilteredAvailableUsers.Clear();
        var term = ParticipantSearch?.Trim() ?? string.Empty;
        var query = AllUsers.Where(u => !SelectedParticipants.Contains(u) && (term.Length==0 || u.Name.Contains(term, StringComparison.OrdinalIgnoreCase)))
                            .OrderBy(u => u.Name);
        foreach (var u in query) FilteredAvailableUsers.Add(u);
    }

    private void UpdateCanCreate()
    {
        OnPropertyChanged(nameof(BasicValidationMessage));
        OnPropertyChanged(nameof(ParticipantsValidationMessage));
        OnPropertyChanged(nameof(ImageValidationMessage));
        OnPropertyChanged(nameof(IsBasicValidationVisible));
        OnPropertyChanged(nameof(IsParticipantsValidationVisible));
        OnPropertyChanged(nameof(IsImageValidationVisible));
        OnPropertyChanged(nameof(CanCreate));
    }

    [RelayCommand]
    private void AddSelectedParticipant()
    {
        if (SelectedAvailableUser is null) return;
        if (!SelectedParticipants.Contains(SelectedAvailableUser))
        {
            SelectedParticipants.Add(SelectedAvailableUser);
            SelectedAvailableUser = null;
            RefreshFiltered();
            UpdateCanCreate();
        }
    }

    [RelayCommand]
    private void RemoveParticipant(UserOption participant)
    {
        if (SelectedParticipants.Remove(participant))
        {
            RefreshFiltered();
            UpdateCanCreate();
        }
    }

    [RelayCommand]
    private void BrowseImage()
    {
        // TODO: integrate with file picker service via DI; for now placeholder
        // ChatImagePath = resultPath; (OnChatImagePathChanged will validate)
    }

    [RelayCommand]
    private void RemoveImage()
    {
        ChatImagePath = string.Empty; // triggers validation reset
        OnPropertyChanged(nameof(HasImage)); // explicit to ensure bindings refresh immediately
        UpdateCanCreate();
    }

    [RelayCommand]
    private async void CreateChat()
    {
        // Re-validate image once more before creation (in case file was deleted after selection)
        RecalculateImageValidation();
        UpdateCanCreate();
        if (!CanCreate) return;

        // For direct chat, we only need one participant
        var targetUser = SelectedParticipants.FirstOrDefault();
        if (targetUser == null || string.IsNullOrEmpty(targetUser.UserId))
        {
            System.Diagnostics.Debug.WriteLine("[NewChatViewModel] Cannot create chat: No valid participant selected");
            return;
        }

        try
        {
            if (_chatService == null)
            {
                // For unit tests - invoke callbacks without API call
                var result = new ChatCreationResult
                {
                    ConversationId = Guid.NewGuid().ToString(),
                    Name = ChatName.Trim(),
                    Description = Description.Trim(),
                    IsPublic = IsPublic,
                    AllowInvites = AllowInvites,
                    ImagePath = HasImage ? ChatImagePath : null,
                    Participants = SelectedParticipants.Select(p => p.Name).ToArray()
                };
                OnCreated?.Invoke(result);
                NavigateBack?.Invoke();
                return;
            }

            // Create direct conversation via API
            var conversation = await _chatService.CreateDirectConversationAsync(targetUser.UserId);
            
            if (conversation != null)
            {
                var result = new ChatCreationResult
                {
                    ConversationId = conversation.Id,
                    Name = targetUser.Name,
                    Description = Description.Trim(),
                    IsPublic = IsPublic,
                    AllowInvites = AllowInvites,
                    ImagePath = HasImage ? ChatImagePath : null,
                    Participants = SelectedParticipants.Select(p => p.Name).ToArray()
                };
                OnCreated?.Invoke(result);
                NavigateBack?.Invoke();
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("[NewChatViewModel] Failed to create conversation: API returned null");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[NewChatViewModel] Error creating conversation: {ex.Message}");
        }
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }

    public record UserOption
    {
        public string UserId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public string Role { get; init; } = string.Empty;
        public override string ToString() => Name;
    }

    public class ChatCreationResult
    {
        public string ConversationId { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public bool AllowInvites { get; set; }
        public string? ImagePath { get; set; }
        public string[] Participants { get; set; } = Array.Empty<string>();
    }
}
