using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Avalonia;
using Avalonia.Media;
using System.Collections.Specialized;
using Microsoft.Extensions.DependencyInjection;
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class ChatViewModel : ViewModelBase
{
    private readonly IChatService _chatService;
    private readonly string _userId;

    public Action<ViewModelBase>? NavigateTo { get; set; }
    public Action? NavigateBack { get; set; } // newly added for shell back navigation

    [ObservableProperty] private string _title = "Chat Management";
    [ObservableProperty] private ObservableCollection<ChatConversationViewModel> _conversations = new();
    [ObservableProperty] private ObservableCollection<ChatConversationViewModel> _filteredConversations = new();
    [ObservableProperty] private ChatConversationViewModel? _selectedConversation;
    [ObservableProperty] private string _searchText = "";
    [ObservableProperty] private string _newMessage = "";
    [ObservableProperty] private string? _selectedUserType;
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private bool _isLoadingMessages;
    [ObservableProperty] private bool _isContactInfoModalVisible = false;

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

        Conversations.CollectionChanged += Conversations_CollectionChanged;

        FilteredConversations = new ObservableCollection<ChatConversationViewModel>(Conversations);
        SelectedConversation = FilteredConversations.FirstOrDefault();

        // Listen for theme changes to refresh dynamic brushes
        if (Application.Current is { } app)
        {
            app.ActualThemeVariantChanged += (_, __) => RefreshAllThemeDependentBrushes();
        }
    }

    public ChatViewModel(IChatService chatService, string userId)
    {
        _chatService = chatService;
        _userId = userId;
        Conversations = new ObservableCollection<ChatConversationViewModel>();
        FilteredConversations = new ObservableCollection<ChatConversationViewModel>();
        Conversations.CollectionChanged += Conversations_CollectionChanged;

        // Listen for theme changes to refresh dynamic brushes
        if (Application.Current is { } app)
        {
            app.ActualThemeVariantChanged += (_, __) => RefreshAllThemeDependentBrushes();
        }

        _ = LoadConversationsAsync();
    }

    private async Task LoadConversationsAsync()
    {
        try
        {
            IsLoading = true;
            var response = await _chatService.GetConversationsAsync();
            
            if (response?.Conversations != null)
            {
                Conversations.Clear();
                foreach (var dto in response.Conversations)
                {
                    var conv = MapConversationDtoToViewModel(dto);
                    conv.RefreshTheme();
                    Conversations.Add(conv);
                }
                ApplyFilters();
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[ChatViewModel] Error loading conversations: {ex.Message}");
        }
        finally
        {
            IsLoading = false;
            OnPropertyChanged(nameof(HasConversations));
        }
    }

    private async Task LoadMessagesAsync(ChatConversationViewModel conversation)
    {
        if (string.IsNullOrEmpty(conversation.ConversationId))
            return;

        try
        {
            IsLoadingMessages = true;
            var response = await _chatService.GetMessagesAsync(conversation.ConversationId);
            
            if (response?.Messages != null)
            {
                MergeMessages(conversation, response.Messages);
                SortMessagesAscending(conversation);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[ChatViewModel] Error loading messages: {ex.Message}");
        }
        finally
        {
            IsLoadingMessages = false;
        }
    }

    private ChatConversationViewModel MapConversationDtoToViewModel(ConversationDto dto)
    {
        var otherParticipant = dto.Participants?
            .FirstOrDefault(p => p.UserId != _userId)
            ?.User;

        var contactName = otherParticipant?.FullName ?? "Unknown";
        var contactRole = dto.Participants?
            .FirstOrDefault(p => p.UserId != _userId)
            ?.Role ?? "User";
        
        // Capitalize role for display
        contactRole = contactRole switch
        {
            "admin" => "Admin",
            "teacher" => "Teacher",
            "student" => "Student",
            _ => contactRole
        };

        var initials = GetInitials(contactName);
        var lastMessage = dto.LastMessage?.Content ?? "";
        var lastMessageTime = dto.LastMessage?.CreatedAt ?? dto.UpdatedAt;

        return new ChatConversationViewModel
        {
            ConversationId = dto.Id,
            ContactName = contactName,
            ContactRole = contactRole,
            ContactInitials = initials,
            LastMessage = lastMessage,
            LastMessageTime = lastMessageTime,
            IsOnline = false, // TODO: Implement presence tracking
            UnreadCount = dto.UnreadCount,
            Messages = new ObservableCollection<ChatMessageViewModel>()
        };
    }

    private ChatMessageViewModel MapMessageDtoToViewModel(MessageDto dto)
    {
        var isFromCurrentUser = dto.SenderId == _userId;
        var senderName = isFromCurrentUser ? "You" : (dto.Sender?.FullName ?? "Unknown");

        return new ChatMessageViewModel
        {
            MessageId = ComputeMessageKey(dto),
            SenderName = senderName,
            Content = dto.Content,
            Timestamp = dto.CreatedAt,
            IsFromCurrentUser = isFromCurrentUser
        };
    }

    private static string ComputeMessageKey(MessageDto dto)
    {
        // Prefer server id when available; otherwise use a deterministic composite key
        if (!string.IsNullOrWhiteSpace(dto.Id))
            return dto.Id;
        var contentHash = dto.Content?.GetHashCode() ?? 0;
        return $"{dto.SenderId}|{dto.CreatedAt.Ticks}|{contentHash}";
    }

    private static void SortMessagesAscending(ChatConversationViewModel conversation)
    {
        var ordered = conversation.Messages.OrderBy(m => m.Timestamp).ToList();
        for (int i = 0; i < ordered.Count; i++)
        {
            if (!ReferenceEquals(conversation.Messages[i], ordered[i]))
            {
                var currentIndex = conversation.Messages.IndexOf(ordered[i]);
                if (currentIndex >= 0 && currentIndex != i)
                {
                    conversation.Messages.Move(currentIndex, i);
                }
            }
        }
    }

    private void MergeMessages(ChatConversationViewModel conversation, IEnumerable<MessageDto> apiMessages)
    {
        // Index existing messages by MessageId when available
        var existingById = conversation.Messages
            .Where(m => !string.IsNullOrWhiteSpace(m.MessageId))
            .ToDictionary(m => m.MessageId, m => m);

        foreach (var dto in apiMessages)
        {
            var key = ComputeMessageKey(dto);

            if (existingById.TryGetValue(key, out var existing))
            {
                // Refresh existing from server
                existing.Timestamp = dto.CreatedAt;
                existing.Content = dto.Content;
                existing.MessageId = key; // ensure finalized id
            }
            else
            {
                // Try to reconcile with an optimistic message (same author, similar time, same content)
                var optimisticMatch = conversation.Messages.FirstOrDefault(m =>
                    m.MessageId.StartsWith("optimistic:") &&
                    m.IsFromCurrentUser &&
                    string.Equals(m.Content, dto.Content, StringComparison.Ordinal) &&
                    Math.Abs((m.Timestamp - dto.CreatedAt).TotalMinutes) <= 2);

                if (optimisticMatch != null)
                {
                    optimisticMatch.MessageId = key;
                    optimisticMatch.Timestamp = dto.CreatedAt;
                    optimisticMatch.Content = dto.Content;
                }
                else
                {
                    var vm = MapMessageDtoToViewModel(dto);
                    vm.RefreshTheme();
                    conversation.Messages.Add(vm);
                }
            }
        }
    }

    private static string GetInitials(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return "U";
        
        var parts = name.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (parts.Length == 0) return "U";
        if (parts.Length == 1) return parts[0][0].ToString().ToUpper();
        
        return $"{parts[0][0]}{parts[^1][0]}".ToUpper();
    }

    private void Conversations_CollectionChanged(object? sender, NotifyCollectionChangedEventArgs e)
    {
        if (e.NewItems != null)
        {
            foreach (ChatConversationViewModel c in e.NewItems)
                c.RefreshTheme();
        }
    }

    private void RefreshAllThemeDependentBrushes()
    {
        foreach (var c in Conversations)
            c.RefreshTheme();
        if (SelectedConversation != null)
            SelectedConversation.RefreshTheme();
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
    private async void SelectConversation(ChatConversationViewModel conversation)
    {
        var wasSame = SelectedConversation == conversation;
        SelectedConversation = conversation;
        
        // Load messages if not already loaded
        if (conversation.Messages.Count == 0 && !string.IsNullOrEmpty(conversation.ConversationId))
        {
            await LoadMessagesAsync(conversation);
        }
        
        // Mark as read
        if (conversation.UnreadCount > 0)
        {
            conversation.UnreadCount = 0;
            if (!string.IsNullOrEmpty(conversation.ConversationId))
            {
                _ = _chatService?.MarkAsReadAsync(conversation.ConversationId);
            }
        }
        
        ConversationNavigationRequested?.Invoke(this, new ConversationNavigationEventArgs(conversation, ConversationNavigationType.OpenChat));
        if (wasSame) OnPropertyChanged(nameof(SelectedConversation));
    }

    [RelayCommand]
    private async void SendMessage()
    {
        if (SelectedConversation == null || string.IsNullOrWhiteSpace(NewMessage) || _chatService == null)
            return;

        if (string.IsNullOrEmpty(SelectedConversation.ConversationId))
        {
            System.Diagnostics.Debug.WriteLine("[ChatViewModel] Cannot send message: ConversationId is missing");
            return;
        }

        var messageText = NewMessage.Trim();
        NewMessage = "";

        // Optimistically add message to UI
        var optimisticMessage = new ChatMessageViewModel
        {
            MessageId = $"optimistic:{Guid.NewGuid()}",
            SenderName = "You",
            Content = messageText,
            Timestamp = DateTime.Now,
            IsFromCurrentUser = true,
            Status = MessageStatus.Sending
        };
        optimisticMessage.RefreshTheme();
        SelectedConversation.Messages.Add(optimisticMessage);
        SelectedConversation.LastMessage = messageText;
        SelectedConversation.LastMessageTime = DateTime.Now;

        // Send to API
        try
        {
            var response = await _chatService.SendMessageAsync(SelectedConversation.ConversationId, messageText);
            if (response != null)
            {
                // Update optimistic message with real data and finalized id
                optimisticMessage.MessageId = ComputeMessageKey(response);
                optimisticMessage.Timestamp = response.CreatedAt;
                optimisticMessage.Content = response.Content;
                optimisticMessage.Status = MessageStatus.Sent;
                SortMessagesAscending(SelectedConversation);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[ChatViewModel] Error sending message: {ex.Message}");
            // Remove optimistic message on error
            SelectedConversation.Messages.Remove(optimisticMessage);
            NewMessage = messageText; // Restore message text
        }
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
        if (NavigateTo is null || _chatService == null) return;
        
        var apiClient = ServiceLocator.Services.GetRequiredService<Services.IApiClient>();
        var newVm = new NewChatViewModel(_chatService, apiClient, _userId)
        {
            NavigateBack = () => NavigateTo?.Invoke(this),
            OnCreated = res => 
            { 
                // Reload conversations to include the new one
                _ = LoadConversationsAsync();
                NavigateTo?.Invoke(this); 
            }
        };
        NavigateTo(newVm);
    }

    [RelayCommand]
    private async Task ShowContactInfo()
    {
        IsContactInfoModalVisible = true;
    }

    [RelayCommand]
    private void CloseContactInfoModal()
    {
        IsContactInfoModalVisible = false;
    }

    [RelayCommand]
    private async Task DeleteConversation()
    {
        if (SelectedConversation == null || string.IsNullOrEmpty(SelectedConversation.ConversationId) || _chatService == null)
            return;

        var conversationId = SelectedConversation.ConversationId;
        var conversationName = SelectedConversation.ContactName;

        try
        {
            var success = await _chatService.DeleteConversationAsync(conversationId);
            
            if (success)
            {
                // Remove conversation from collections
                Conversations.Remove(SelectedConversation);
                FilteredConversations.Remove(SelectedConversation);
                
                // Clear selection (navigate back to list)
                SelectedConversation = null;
                
                // Close modal
                IsContactInfoModalVisible = false;
                
                // Reload conversations to refresh the list
                _ = LoadConversationsAsync();
                
                System.Diagnostics.Debug.WriteLine($"[ChatViewModel] Conversation with {conversationName} deleted successfully");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"[ChatViewModel] Failed to delete conversation with {conversationName}");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[ChatViewModel] Error deleting conversation: {ex.Message}");
        }
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
    public string ConversationId { get; set; } = ""; // Store API conversation ID

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

    public void RefreshTheme()
    {
        OnPropertyChanged(nameof(RoleBrush));
        OnPropertyChanged(nameof(RoleTextBrush));
        foreach (var m in Messages)
            m.RefreshTheme();
    }

    partial void OnLastMessageTimeChanged(DateTime value) => OnPropertyChanged(nameof(LastMessageTimeText));
    partial void OnUnreadCountChanged(int value) => OnPropertyChanged(nameof(HasUnreadMessages));
    partial void OnContactRoleChanged(string value)
    {
        OnPropertyChanged(nameof(RoleBrush));
        OnPropertyChanged(nameof(RoleTextBrush));
    }
}

public enum MessageStatus
{
    Sending,
    Sent
}

public partial class ChatMessageViewModel : ViewModelBase
{
    // Stable identifier for reconciliation between optimistic and server messages
    public string MessageId { get; set; } = ""; // optimistic messages use prefix: "optimistic:"
    [ObservableProperty] private string _senderName = "";
    [ObservableProperty] private string _content = "";
    [ObservableProperty] private DateTime _timestamp;
    [ObservableProperty] private bool _isFromCurrentUser;
    [ObservableProperty] private MessageStatus _status = MessageStatus.Sent; // Default to Sent for received messages

    public string TimestampText => Timestamp.ToString("h:mm tt");
    public string MessageAlignment => IsFromCurrentUser ? "Right" : "Left";
    public bool IsSending => Status == MessageStatus.Sending;
    public bool IsSentStatus => Status == MessageStatus.Sent;

    partial void OnStatusChanged(MessageStatus value)
    {
        OnPropertyChanged(nameof(IsSending));
        OnPropertyChanged(nameof(IsSentStatus));
    }

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
        ? Resolve("DangerBrush", "AccentBrush")
        : Resolve("CardBackgroundBrush", "PageBackgroundBrush");

    public IBrush MessageTextBrush => IsFromCurrentUser
        ? Resolve("AccentTextOnAccentBrush", "TextPrimaryBrush")
        : Resolve("TextPrimaryBrush", "TextPrimaryBrush");

    public void RefreshTheme()
    {
        OnPropertyChanged(nameof(MessageBackgroundBrush));
        OnPropertyChanged(nameof(MessageTextBrush));
    }

    partial void OnTimestampChanged(DateTime value) => OnPropertyChanged(nameof(TimestampText));
    partial void OnIsFromCurrentUserChanged(bool value)
    {
        OnPropertyChanged(nameof(MessageBackgroundBrush));
        OnPropertyChanged(nameof(MessageTextBrush));
        OnPropertyChanged(nameof(MessageAlignment));
    }
}