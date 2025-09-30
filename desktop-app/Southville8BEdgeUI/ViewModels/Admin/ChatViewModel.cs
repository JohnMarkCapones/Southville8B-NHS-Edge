using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using Avalonia;
using Avalonia.Media;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class ChatViewModel : ViewModelBase
{
    public Action<ViewModelBase>? NavigateTo { get; set; }

    [ObservableProperty] private string _title = "Chat Management";
    [ObservableProperty] private ObservableCollection<ChatConversationViewModel> _conversations = new();
    [ObservableProperty] private ObservableCollection<ChatConversationViewModel> _filteredConversations = new();
    [ObservableProperty] private ChatConversationViewModel? _selectedConversation;
    [ObservableProperty] private string _searchText = "";
    [ObservableProperty] private string _newMessage = "";
    [ObservableProperty] private string? _selectedUserType;

    public ObservableCollection<string> UserTypeOptions { get; } = new() { "All Users", "Admins", "Teachers" };

    public bool HasConversations => FilteredConversations?.Any() == true;
    public bool HasSelectedConversation => SelectedConversation != null;

    // Event for mobile navigation communication between View and ViewModel
    public event EventHandler<ConversationNavigationEventArgs>? ConversationNavigationRequested;

    public ChatViewModel()
    {
        // Sample conversation data
        Conversations = new ObservableCollection<ChatConversationViewModel>
        {
            new()
            {
                ContactName = "Maria Rodriguez",
                ContactRole = "Teacher",
                ContactInitials = "MR",
                LastMessage = "Thank you for approving the room booking for tomorrow's science fair.",
                LastMessageTime = DateTime.Now.AddMinutes(-15),
                IsOnline = true,
                UnreadCount = 0,
                Messages = new ObservableCollection<ChatMessageViewModel>
                {
                    new() { SenderName = "Maria Rodriguez", Content = "Hi, I need to book Room 201 for tomorrow's science fair preparation.", Timestamp = DateTime.Now.AddHours(-2), IsFromCurrentUser = false },
                    new() { SenderName = "You", Content = "Hello Maria! Let me check the availability for Room 201 tomorrow.", Timestamp = DateTime.Now.AddHours(-2).AddMinutes(5), IsFromCurrentUser = true },
                    new() { SenderName = "You", Content = "Room 201 is available from 8:00 AM to 5:00 PM tomorrow. I've approved your booking.", Timestamp = DateTime.Now.AddHours(-2).AddMinutes(10), IsFromCurrentUser = true },
                    new() { SenderName = "Maria Rodriguez", Content = "Thank you for approving the room booking for tomorrow's science fair.", Timestamp = DateTime.Now.AddMinutes(-15), IsFromCurrentUser = false }
                }
            },
            new()
            {
                ContactName = "Robert Wilson",
                ContactRole = "Admin",
                ContactInitials = "RW",
                LastMessage = "The new user management system is ready for testing.",
                LastMessageTime = DateTime.Now.AddHours(-1),
                IsOnline = true,
                UnreadCount = 2,
                Messages = new ObservableCollection<ChatMessageViewModel>
                {
                    new() { SenderName = "Robert Wilson", Content = "Hey, I've finished implementing the new user management features.", Timestamp = DateTime.Now.AddHours(-3), IsFromCurrentUser = false },
                    new() { SenderName = "You", Content = "Great work! When can we schedule the testing phase?", Timestamp = DateTime.Now.AddHours(-2).AddMinutes(-30), IsFromCurrentUser = true },
                    new() { SenderName = "Robert Wilson", Content = "The new user management system is ready for testing.", Timestamp = DateTime.Now.AddHours(-1), IsFromCurrentUser = false },
                    new() { SenderName = "Robert Wilson", Content = "We can start testing this afternoon if you're available.", Timestamp = DateTime.Now.AddMinutes(-50), IsFromCurrentUser = false }
                }
            },
            new()
            {
                ContactName = "Dr. Michael Brown",
                ContactRole = "Teacher",
                ContactInitials = "MB",
                LastMessage = "Could you help me reset a student's password?",
                LastMessageTime = DateTime.Now.AddHours(-3),
                IsOnline = false,
                UnreadCount = 1,
                Messages = new ObservableCollection<ChatMessageViewModel>
                {
                    new() { SenderName = "Dr. Michael Brown", Content = "Hi, one of my students forgot their password and can't access the portal.", Timestamp = DateTime.Now.AddHours(-4), IsFromCurrentUser = false },
                    new() { SenderName = "You", Content = "I can help with that. What's the student's ID number?", Timestamp = DateTime.Now.AddHours(-3).AddMinutes(-45), IsFromCurrentUser = true },
                    new() { SenderName = "Dr. Michael Brown", Content = "Could you help me reset a student's password?", Timestamp = DateTime.Now.AddHours(-3), IsFromCurrentUser = false }
                }
            },
            new()
            {
                ContactName = "Jennifer Taylor",
                ContactRole = "Teacher",
                ContactInitials = "JT",
                LastMessage = "The new event has been scheduled successfully.",
                LastMessageTime = DateTime.Now.AddDays(-1),
                IsOnline = false,
                UnreadCount = 0,
                Messages = new ObservableCollection<ChatMessageViewModel>
                {
                    new() { SenderName = "Jennifer Taylor", Content = "I need to schedule a parent-teacher conference for next week.", Timestamp = DateTime.Now.AddDays(-1).AddHours(-2), IsFromCurrentUser = false },
                    new() { SenderName = "You", Content = "Sure! What date and time works best for you?", Timestamp = DateTime.Now.AddDays(-1).AddHours(-1), IsFromCurrentUser = true },
                    new() { SenderName = "Jennifer Taylor", Content = "The new event has been scheduled successfully.", Timestamp = DateTime.Now.AddDays(-1), IsFromCurrentUser = false }
                }
            },
            new()
            {
                ContactName = "Catherine Martinez",
                ContactRole = "Admin",
                ContactInitials = "CM",
                LastMessage = "System backup completed successfully.",
                LastMessageTime = DateTime.Now.AddDays(-2),
                IsOnline = true,
                UnreadCount = 0,
                Messages = new ObservableCollection<ChatMessageViewModel>
                {
                    new() { SenderName = "You", Content = "Catherine, can you run the weekly system backup?", Timestamp = DateTime.Now.AddDays(-2).AddHours(-1), IsFromCurrentUser = true },
                    new() { SenderName = "Catherine Martinez", Content = "System backup completed successfully.", Timestamp = DateTime.Now.AddDays(-2), IsFromCurrentUser = false }
                }
            }
        };

        FilteredConversations = new ObservableCollection<ChatConversationViewModel>(Conversations);
        SelectedConversation = FilteredConversations.FirstOrDefault();
    }

    partial void OnSearchTextChanged(string value) => ApplyFilters();
    partial void OnSelectedUserTypeChanged(string? value) => ApplyFilters();

    private void ApplyFilters()
    {
        var filtered = Conversations.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(SearchText))
        {
            filtered = filtered.Where(c => c.ContactName.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                                           c.LastMessage.Contains(SearchText, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(SelectedUserType) && SelectedUserType != "All Users")
        {
            var roleFilter = SelectedUserType == "Admins" ? "Admin" : "Teacher";
            filtered = filtered.Where(c => c.ContactRole == roleFilter);
        }

        FilteredConversations.Clear();
        foreach (var conversation in filtered)
            FilteredConversations.Add(conversation);

        OnPropertyChanged(nameof(HasConversations));

        if (SelectedConversation != null && !FilteredConversations.Contains(SelectedConversation))
            SelectedConversation = FilteredConversations.FirstOrDefault();
    }

    [RelayCommand]
    private void SelectConversation(ChatConversationViewModel conversation)
    {
        var wasSame = SelectedConversation == conversation;
        SelectedConversation = conversation;
        conversation.UnreadCount = 0;
        ConversationNavigationRequested?.Invoke(this, new ConversationNavigationEventArgs(conversation, ConversationNavigationType.OpenChat));
        if (wasSame) OnPropertyChanged(nameof(SelectedConversation));
    }

    [RelayCommand]
    private void SendMessage()
    {
        if (SelectedConversation == null || string.IsNullOrWhiteSpace(NewMessage)) return;

        var text = NewMessage.Trim();
        var msg = new ChatMessageViewModel
        {
            SenderName = "You",
            Content = text,
            Timestamp = DateTime.Now,
            IsFromCurrentUser = true
        };
        SelectedConversation.Messages.Add(msg);
        SelectedConversation.LastMessage = text;
        SelectedConversation.LastMessageTime = DateTime.Now;
        NewMessage = "";
    }

    private void AddConversationFromResult(NewChatViewModel.ChatCreationResult result)
    {
        var initials = string.Concat(result.Name.Split(' ', StringSplitOptions.RemoveEmptyEntries).Take(2).Select(s => char.ToUpperInvariant(s[0])));
        var convo = new ChatConversationViewModel
        {
            ContactName = result.Name,
            ContactRole = result.IsPublic ? "Public" : "Private",
            ContactInitials = string.IsNullOrWhiteSpace(initials) ? "NC" : initials,
            LastMessage = "Conversation created",
            LastMessageTime = DateTime.Now,
            IsOnline = false,
            UnreadCount = 0,
            Messages = new ObservableCollection<ChatMessageViewModel>()
        };
        Conversations.Insert(0, convo);
        ApplyFilters();
        SelectedConversation = convo;
    }

    [RelayCommand]
    private void StartNewChat()
    {
        if (NavigateTo is null) return;
        var newVm = new NewChatViewModel
        {
            NavigateBack = () => NavigateTo?.Invoke(this),
            OnCreated = res => { AddConversationFromResult(res); NavigateTo?.Invoke(this); }
        };
        NavigateTo(newVm);
    }

    // Method to request navigation back to conversations (for mobile back button)
    public void RequestNavigateToConversations() =>
        ConversationNavigationRequested?.Invoke(this, new ConversationNavigationEventArgs(null, ConversationNavigationType.BackToConversations));

    partial void OnSelectedConversationChanged(ChatConversationViewModel? value) => OnPropertyChanged(nameof(HasSelectedConversation));
}

// Event args for conversation navigation
public class ConversationNavigationEventArgs : EventArgs
{
    public ChatConversationViewModel? Conversation { get; }
    public ConversationNavigationType NavigationType { get; }

    public ConversationNavigationEventArgs(ChatConversationViewModel? conversation, ConversationNavigationType navigationType)
    { Conversation = conversation; NavigationType = navigationType; }
}

// Enum for navigation types
public enum ConversationNavigationType { OpenChat, BackToConversations }

public partial class ChatConversationViewModel : ViewModelBase
{
    [ObservableProperty] private string _contactName = "";
    [ObservableProperty] private string _contactRole = "";
    [ObservableProperty] private string _contactInitials = "";
    [ObservableProperty] private string _lastMessage = "";
    [ObservableProperty] private DateTime _lastMessageTime;
    [ObservableProperty] private bool _isOnline;
    [ObservableProperty] private int _unreadCount;
    [ObservableProperty] private ObservableCollection<ChatMessageViewModel> _messages = new();

    public string LastMessageTimeText => LastMessageTime.Date == DateTime.Today ? LastMessageTime.ToString("HH:mm") : LastMessageTime.ToString("MMM dd");
    public bool HasUnreadMessages => UnreadCount > 0;

    private static IBrush Resolve(string key, string fallback)
    {
        if (Application.Current is { } app)
        {
            if (app.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b) return b;
            if (app.TryGetResource(fallback, app.ActualThemeVariant, out var f) && f is IBrush fb) return fb;
        }
        return Brushes.Transparent;
    }

    public IBrush RoleBrush => ContactRole switch
    {
        "Admin" => Resolve("DangerBrush", "AccentBrush"),
        "Teacher" => Resolve("PurpleBrush", "AccentBrush"),
        "Public" => Resolve("SuccessBrush", "AccentBrush"),
        "Private" => Resolve("IndigoBrush", "AccentBrush"),
        _ => Resolve("TextSecondaryBrush", "TextMutedBrush")
    };

    public IBrush RoleTextBrush => ContactRole switch
    {
        "Admin" or "Teacher" or "Public" or "Private" => Resolve("AccentTextOnAccentBrush", "TextPrimaryBrush"),
        _ => Resolve("TextPrimaryBrush", "TextPrimaryBrush")
    };

    partial void OnLastMessageTimeChanged(DateTime value) => OnPropertyChanged(nameof(LastMessageTimeText));
    partial void OnUnreadCountChanged(int value) => OnPropertyChanged(nameof(HasUnreadMessages));
    partial void OnContactRoleChanged(string value)
    {
        OnPropertyChanged(nameof(RoleBrush));
        OnPropertyChanged(nameof(RoleTextBrush));
    }
}

public partial class ChatMessageViewModel : ViewModelBase
{
    [ObservableProperty] private string _senderName = "";
    [ObservableProperty] private string _content = "";
    [ObservableProperty] private DateTime _timestamp;
    [ObservableProperty] private bool _isFromCurrentUser;

    public string TimestampText => Timestamp.ToString("HH:mm");
    public string MessageAlignment => IsFromCurrentUser ? "Right" : "Left";

    private static IBrush Resolve(string key, string fallback)
    {
        if (Application.Current is { } app)
        {
            if (app.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b) return b;
            if (app.TryGetResource(fallback, app.ActualThemeVariant, out var f) && f is IBrush fb) return fb;
        }
        return Brushes.Transparent;
    }

    public IBrush MessageBackgroundBrush => IsFromCurrentUser
        ? Resolve("IndigoBrush", "AccentBrush")
        : Resolve("CardBackgroundBrush", "PageBackgroundBrush");

    public IBrush MessageTextBrush => IsFromCurrentUser
        ? Resolve("AccentTextOnAccentBrush", "TextPrimaryBrush")
        : Resolve("TextPrimaryBrush", "TextPrimaryBrush");

    partial void OnTimestampChanged(DateTime value) => OnPropertyChanged(nameof(TimestampText));
    partial void OnIsFromCurrentUserChanged(bool value)
    {
        OnPropertyChanged(nameof(MessageBackgroundBrush));
        OnPropertyChanged(nameof(MessageTextBrush));
        OnPropertyChanged(nameof(MessageAlignment));
    }
}