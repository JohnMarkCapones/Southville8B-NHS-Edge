using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class NewChatViewModel : ViewModelBase
{
    private readonly IChatService? _chatService;
    private readonly IApiClient? _apiClient;
    private readonly string? _currentUserId;

    public Action? NavigateBack { get; set; }
    public Action<ConversationViewModel>? OnConversationCreated { get; set; }

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(CreateCommand))]
    private string _userSearch = string.Empty;

    [ObservableProperty]
    [NotifyCanExecuteChangedFor(nameof(CreateCommand))]
    private UserOption? _selectedUser;

    [ObservableProperty] private bool _isLoadingUsers;
    [ObservableProperty] private string _firstMessage = string.Empty;
    [ObservableProperty] private bool _markAsImportant;

    public ObservableCollection<UserOption> AllUsers { get; } = new();
    public ObservableCollection<UserOption> FilteredUsers { get; } = new();

    public NewChatViewModel()
    {
        // Default constructor for design mode
    }

    public NewChatViewModel(IChatService chatService, IApiClient apiClient, string currentUserId)
    {
        _chatService = chatService;
        _apiClient = apiClient;
        _currentUserId = currentUserId;
        _ = LoadUsersAsync();
    }

    private bool CanCreate() => SelectedUser != null && !string.IsNullOrEmpty(SelectedUser.UserId);

    private async Task LoadUsersAsync()
    {
        if (_apiClient == null || string.IsNullOrEmpty(_currentUserId)) return;

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

    partial void OnUserSearchChanged(string value) => RefreshFiltered();
    partial void OnSelectedUserChanged(UserOption? value)
    {
        OnPropertyChanged(nameof(CanCreate));
        CreateCommand.NotifyCanExecuteChanged();
    }

    private void RefreshFiltered()
    {
        FilteredUsers.Clear();
        if (string.IsNullOrWhiteSpace(UserSearch))
        {
            foreach (var user in AllUsers)
                FilteredUsers.Add(user);
        }
        else
        {
            var searchLower = UserSearch.ToLowerInvariant();
            foreach (var user in AllUsers.Where(u => 
                u.Name.ToLowerInvariant().Contains(searchLower) ||
                u.Role.ToLowerInvariant().Contains(searchLower)))
            {
                FilteredUsers.Add(user);
            }
        }
    }

    [RelayCommand(CanExecute = nameof(CanCreate))]
    private async Task Create()
    {
        if (SelectedUser == null || string.IsNullOrEmpty(SelectedUser.UserId) || _chatService == null)
            return;

        try
        {
            // Create direct conversation via API
            var conversation = await _chatService.CreateDirectConversationAsync(SelectedUser.UserId);
            
            if (conversation != null)
            {
                var initials = GetInitials(SelectedUser.Name);
                var conv = new ConversationViewModel
                {
                    ConversationId = conversation.Id,
                    ContactName = SelectedUser.Name,
                    ContactRole = SelectedUser.Role,
                    ContactInitials = initials,
                    LastMessage = string.IsNullOrWhiteSpace(FirstMessage) ? "(No messages yet)" : FirstMessage.Trim(),
                    LastMessageTime = "Now",
                    IsOnline = false,
                    UnreadCount = 0,
                    IsSelected = false,
                    Messages = new ObservableCollection<MessageViewModel>()
                };

                // If first message was provided, send it
                if (!string.IsNullOrWhiteSpace(FirstMessage))
                {
                    var message = await _chatService.SendMessageAsync(conversation.Id, FirstMessage.Trim());
                    if (message != null)
                    {
                        conv.Messages.Add(new MessageViewModel
                        {
                            SenderName = "You",
                            Content = FirstMessage.Trim(),
                            Timestamp = message.CreatedAt.ToString("h:mm tt"),
                            IsSent = true,
                            DateSeparator = "Today",
                            ShowDateSeparator = true
                        });
                    }
                }

                OnConversationCreated?.Invoke(conv);
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
    private void Cancel() => NavigateBack?.Invoke();

    private static string GetInitials(string name)
    {
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "";
        if (parts.Length == 1) return parts[0][0].ToString().ToUpperInvariant();
        return (parts[0][0].ToString() + parts[^1][0].ToString()).ToUpperInvariant();
    }

    public record UserOption
    {
        public string UserId { get; init; } = string.Empty;
        public string Name { get; init; } = string.Empty;
        public string Role { get; init; } = string.Empty;
        public override string ToString() => $"{Name} ({Role})";
    }
}
