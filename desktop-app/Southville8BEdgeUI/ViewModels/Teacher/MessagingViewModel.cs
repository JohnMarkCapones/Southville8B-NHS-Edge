using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Avalonia; // resource lookup
using Avalonia.Media; // IBrush
using Avalonia.Styling; // theme variant
using Southville8BEdgeUI.Services;
using Southville8BEdgeUI.Models.Api;
using Microsoft.Extensions.DependencyInjection;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class MessagingViewModel : ViewModelBase
{
    private readonly IChatService _chatService;
    private readonly string _userId;

    [ObservableProperty] private string _title = "Messaging";
    [ObservableProperty] private ObservableCollection<ConversationViewModel> _conversations = new();
    [ObservableProperty] private ConversationViewModel? _selectedConversation;
    [ObservableProperty] private string _searchText = "";
    [ObservableProperty] private string _newMessageText = "";
    [ObservableProperty] private bool _isLoading;
    [ObservableProperty] private bool _isLoadingMessages;
    [ObservableProperty] private bool _isContactInfoModalVisible = false;

    public bool HasConversations => Conversations?.Any() == true;
    public bool HasSelectedConversation => SelectedConversation != null;

    // Navigation callback supplied by shell
    public Action<ViewModelBase>? NavigateTo { get; set; }

    public MessagingViewModel()
    {
        Conversations = new ObservableCollection<ConversationViewModel>
        {
            new ConversationViewModel
            {
                ContactName = "Maria Santos",
                ContactRole = "Parent",
                ContactInitials = "MS",
                LastMessage = "Thank you for the update on John's progress.",
                LastMessageTime = "15 min",
                IsOnline = true,
                UnreadCount = 0,
                IsSelected = false,
                Messages = new ObservableCollection<MessageViewModel>
                {
                    new MessageViewModel
                    {
                        SenderName = "Maria Santos",
                        Content = "Hi, I wanted to ask about John's math grades. Is he keeping up with the class?",
                        Timestamp = "2:30 PM",
                        IsSent = false,
                        DateSeparator = "Today",
                        ShowDateSeparator = true
                    },
                    new MessageViewModel
                    {
                        SenderName = "You",
                        Content = "Hello Maria! John is doing well in math. He's improved significantly in problem-solving.",
                        Timestamp = "2:35 PM",
                        IsSent = true
                    },
                    new MessageViewModel
                    {
                        SenderName = "Maria Santos",
                        Content = "Thank you for the update on John's progress.",
                        Timestamp = "2:45 PM",
                        IsSent = false
                    }
                }
            },
            new ConversationViewModel
            {
                ContactName = "Principal Rodriguez",
                ContactRole = "Admin",
                ContactInitials = "PR",
                LastMessage = "Please submit the quarterly report by Friday.",
                LastMessageTime = "1 hour",
                IsOnline = false,
                UnreadCount = 1,
                IsSelected = false,
                Messages = new ObservableCollection<MessageViewModel>
                {
                    new MessageViewModel
                    {
                        SenderName = "Principal Rodriguez",
                        Content = "Good morning! Could you please submit your quarterly class report by this Friday?",
                        Timestamp = "1:15 PM",
                        IsSent = false,
                        DateSeparator = "Today",
                        ShowDateSeparator = true
                    },
                    new MessageViewModel
                    {
                        SenderName = "Principal Rodriguez",
                        Content = "Please submit the quarterly report by Friday.",
                        Timestamp = "1:30 PM",
                        IsSent = false
                    }
                }
            },
            new ConversationViewModel
            {
                ContactName = "Robert Johnson",
                ContactRole = "Parent",
                ContactInitials = "RJ",
                LastMessage = "Can we schedule a parent-teacher conference?",
                LastMessageTime = "2 days",
                IsOnline = true,
                UnreadCount = 0,
                IsSelected = false,
                Messages = new ObservableCollection<MessageViewModel>
                {
                    new MessageViewModel
                    {
                        SenderName = "Robert Johnson",
                        Content = "Hi, I'd like to discuss Sarah's performance in class. When would be a good time for a conference?",
                        Timestamp = "3:20 PM",
                        IsSent = false,
                        DateSeparator = "Tuesday",
                        ShowDateSeparator = true
                    },
                    new MessageViewModel
                    {
                        SenderName = "You",
                        Content = "Hello Mr. Johnson! I'm available next week on Tuesday or Thursday after 3 PM.",
                        Timestamp = "3:45 PM",
                        IsSent = true
                    },
                    new MessageViewModel
                    {
                        SenderName = "Robert Johnson",
                        Content = "Can we schedule a parent-teacher conference?",
                        Timestamp = "4:00 PM",
                        IsSent = false
                    }
                }
            },
            new ConversationViewModel
            {
                ContactName = "Dr. Emily Chen",
                ContactRole = "Teacher",
                ContactInitials = "EC",
                LastMessage = "The science fair committee meeting is tomorrow.",
                LastMessageTime = "1 day",
                IsOnline = true,
                UnreadCount = 2,
                IsSelected = false,
                Messages = new ObservableCollection<MessageViewModel>
                {
                    new MessageViewModel
                    {
                        SenderName = "Dr. Emily Chen",
                        Content = "Hi! Are you joining the science fair committee meeting tomorrow at 2 PM?",
                        Timestamp = "10:30 AM",
                        IsSent = false,
                        DateSeparator = "Yesterday",
                        ShowDateSeparator = true
                    },
                    new MessageViewModel
                    {
                        SenderName = "Dr. Emily Chen",
                        Content = "The science fair committee meeting is tomorrow.",
                        Timestamp = "11:00 AM",
                        IsSent = false
                    }
                }
            }
        };

        // Initialize themed brushes for conversations/messages
        foreach (var conv in Conversations)
        {
            conv.UpdateRoleBrushes();
            foreach (var msg in conv.Messages)
                msg.UpdateMessageTextBrush();
        }

        SelectedConversation = Conversations.FirstOrDefault();
        if (SelectedConversation != null)
        {
            SelectedConversation.IsSelected = true;
        }
    }

    public MessagingViewModel(IChatService chatService, string userId)
    {
        _chatService = chatService;
        _userId = userId;
        System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] ctor: currentUserId={_userId}");
        // Prevent stale data when switching accounts by clearing chat cache prefix once per VM init
        _chatService.InvalidateCachePrefix("chat/");
        Conversations = new ObservableCollection<ConversationViewModel>();
        _ = LoadConversationsAsync();
    }

    private async Task LoadConversationsAsync()
    {
        try
        {
            IsLoading = true;
            System.Diagnostics.Debug.WriteLine("[MessagingViewModel] LoadConversationsAsync: Fetching conversations");
            var response = await _chatService.GetConversationsAsync();
            
            if (response?.Conversations != null)
            {
                System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] LoadConversationsAsync: Received {response.Conversations.Count} conversations");
                Conversations.Clear();
                foreach (var dto in response.Conversations)
                {
                    System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Mapping conversation - DTO Id: '{dto.Id}'");
                    var conv = MapConversationDtoToViewModel(dto);
                    System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Mapped conversation - ConversationId: '{conv.ConversationId}', ContactName: '{conv.ContactName}'");
                    conv.UpdateRoleBrushes();
                    Conversations.Add(conv);
                }
                System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] LoadConversationsAsync: Successfully loaded {Conversations.Count} conversations");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("[MessagingViewModel] LoadConversationsAsync: Response or Conversations is null");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Error loading conversations: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Stack trace: {ex.StackTrace}");
        }
        finally
        {
            IsLoading = false;
            OnPropertyChanged(nameof(HasConversations));
        }
    }

    private async Task LoadMessagesAsync(ConversationViewModel conversation)
    {
        if (string.IsNullOrEmpty(conversation.ConversationId))
        {
            System.Diagnostics.Debug.WriteLine("[MessagingViewModel] LoadMessagesAsync: ConversationId is empty, returning early");
            return;
        }

        try
        {
            IsLoadingMessages = true;
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] LoadMessagesAsync: Fetching messages for conversation: {conversation.ConversationId}");
            var response = await _chatService.GetMessagesAsync(conversation.ConversationId);
            
            if (response?.Messages != null)
            {
                System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] LoadMessagesAsync: Received {response.Messages.Count} messages");
                if (response.Messages.Count > 0)
                {
                    var first = response.Messages.OrderBy(m => m.CreatedAt).First();
                    var last = response.Messages.OrderBy(m => m.CreatedAt).Last();
                    System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] First sender_id: {first.SenderId}, Last sender_id: {last.SenderId}, CurrentUser: {_userId}");
                }
                conversation.Messages.Clear();
                string? lastDate = null;
                foreach (var msgDto in response.Messages.OrderBy(m => m.CreatedAt))
                {
                    var msg = MapMessageDtoToViewModel(msgDto, lastDate);
                    msg.UpdateMessageTextBrush();
                    conversation.Messages.Add(msg);
                    lastDate = msgDto.CreatedAt.Date.ToShortDateString();
                }
                System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] LoadMessagesAsync: Successfully loaded {conversation.Messages.Count} messages");
                
                // If this is the selected conversation, notify UI about the messages collection change
                if (SelectedConversation == conversation)
                {
                    OnPropertyChanged(nameof(SelectedConversation));
                    System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] LoadMessagesAsync: Notified UI about SelectedConversation update");
                }
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("[MessagingViewModel] LoadMessagesAsync: Response or Messages is null");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Error loading messages: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Stack trace: {ex.StackTrace}");
        }
        finally
        {
            IsLoadingMessages = false;
        }
    }

    private ConversationViewModel MapConversationDtoToViewModel(ConversationDto dto)
    {
        System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] MapConversationDtoToViewModel: DTO Id = '{dto.Id}'");
        
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
        var lastMessageTime = FormatTimeAgo(dto.LastMessage?.CreatedAt ?? dto.UpdatedAt);

        var viewModel = new ConversationViewModel
        {
            ConversationId = dto.Id, // Verify this is set correctly
            ContactName = contactName,
            ContactRole = contactRole,
            ContactInitials = initials,
            LastMessage = lastMessage,
            LastMessageTime = lastMessageTime,
            IsOnline = false, // TODO: Implement presence tracking
            UnreadCount = dto.UnreadCount,
            IsSelected = false,
            Messages = new ObservableCollection<MessageViewModel>()
        };
        
        System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] MapConversationDtoToViewModel: Created ViewModel with ConversationId = '{viewModel.ConversationId}'");
        
        return viewModel;
    }

    private MessageViewModel MapMessageDtoToViewModel(MessageDto dto, string? lastDate)
    {
        var isSent = string.Equals(dto.SenderId, _userId, StringComparison.OrdinalIgnoreCase);
        System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] MapMessageDtoToViewModel: messageId={dto.Id}, conv={dto.ConversationId}, sender_id={dto.SenderId}, currentUser={_userId}, isSent={isSent}");
        var senderName = isSent ? "You" : (dto.Sender?.FullName ?? "Unknown");
        var timestamp = dto.CreatedAt.ToString("h:mm tt");
        var currentDate = dto.CreatedAt.Date.ToShortDateString();
        
        var showDateSeparator = lastDate != currentDate;
        var dateSeparator = showDateSeparator ? FormatDateSeparator(dto.CreatedAt) : "";

        return new MessageViewModel
        {
            SenderName = senderName,
            Content = dto.Content,
            Timestamp = timestamp,
            IsSent = isSent,
            DateSeparator = dateSeparator,
            ShowDateSeparator = showDateSeparator
        };
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

    private static string FormatTimeAgo(DateTime dateTime)
    {
        var now = DateTime.Now;
        var diff = now - dateTime;

        if (diff.TotalMinutes < 1)
            return "Now";
        if (diff.TotalMinutes < 60)
            return $"{(int)diff.TotalMinutes} min";
        if (diff.TotalHours < 24)
            return $"{(int)diff.TotalHours} hour{(diff.TotalHours >= 2 ? "s" : "")}";
        if (diff.TotalDays < 7)
            return $"{(int)diff.TotalDays} day{(diff.TotalDays >= 2 ? "s" : "")}";
        
        return dateTime.ToString("MMM dd");
    }

    private static string FormatDateSeparator(DateTime dateTime)
    {
        var now = DateTime.Now;
        var diff = now.Date - dateTime.Date;

        if (diff.TotalDays == 0)
            return "Today";
        if (diff.TotalDays == 1)
            return "Yesterday";
        if (diff.TotalDays < 7)
            return dateTime.ToString("dddd");
        
        return dateTime.ToString("MMM dd, yyyy");
    }

    partial void OnSearchTextChanged(string value) => ApplyFilters();

    private void ApplyFilters()
    {
        OnPropertyChanged(nameof(HasConversations));
    }

    [RelayCommand]
    private async void SelectConversation(ConversationViewModel conversation)
    {
        try
        {
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] SelectConversation called for: {conversation?.ContactName}");
            
            if (conversation == null)
            {
                System.Diagnostics.Debug.WriteLine("[MessagingViewModel] Conversation is null!");
                return;
            }
            
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] ConversationId: '{conversation.ConversationId}'");
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Has {conversation.Messages.Count} messages already loaded");

            if (SelectedConversation != null)
            {
                SelectedConversation.IsSelected = false;
            }

            // Set SelectedConversation - this should trigger OnSelectedConversationChanged
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Setting SelectedConversation to: {conversation.ContactName}");
            SelectedConversation = conversation;
            conversation.IsSelected = true;
            
            // Explicitly notify about HasSelectedConversation to ensure UI updates
            OnPropertyChanged(nameof(HasSelectedConversation));
            OnPropertyChanged(nameof(SelectedConversation));
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] HasSelectedConversation after setting: {HasSelectedConversation}");
            
            // Load messages if not already loaded
            if (conversation.Messages.Count == 0 && !string.IsNullOrEmpty(conversation.ConversationId))
            {
                System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Loading messages for conversation: {conversation.ConversationId}");
                await LoadMessagesAsync(conversation);
            }
            else if (string.IsNullOrEmpty(conversation.ConversationId))
            {
                System.Diagnostics.Debug.WriteLine("[MessagingViewModel] WARNING: ConversationId is empty, cannot load messages");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Messages already loaded ({conversation.Messages.Count} messages)");
            }
            
            // Mark as read
            if (conversation.UnreadCount > 0 && !string.IsNullOrEmpty(conversation.ConversationId))
            {
                System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Marking conversation as read: {conversation.ConversationId}");
                conversation.UnreadCount = 0;
                _ = _chatService?.MarkAsReadAsync(conversation.ConversationId);
            }
            
            // Ensure all property changes are notified
            OnPropertyChanged(nameof(HasSelectedConversation));
            OnPropertyChanged(nameof(SelectedConversation));
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] SelectConversation completed successfully - HasSelectedConversation: {HasSelectedConversation}");
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Error in SelectConversation: {ex.Message}");
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Stack trace: {ex.StackTrace}");
        }
    }

    [RelayCommand]
    private async void SendMessage()
    {
        if (SelectedConversation == null || string.IsNullOrWhiteSpace(NewMessageText) || _chatService == null)
            return;

        if (string.IsNullOrEmpty(SelectedConversation.ConversationId))
        {
            System.Diagnostics.Debug.WriteLine("[MessagingViewModel] Cannot send message: ConversationId is missing");
            return;
        }

        var messageText = NewMessageText.Trim();
        NewMessageText = "";

        // Optimistically add message to UI
        var optimisticMessage = new MessageViewModel
        {
            SenderName = "You",
            Content = messageText,
            Timestamp = DateTime.Now.ToString("h:mm tt"),
            IsSent = true,
            Status = MessageStatus.Sending
        };
        optimisticMessage.UpdateMessageTextBrush();
        SelectedConversation.Messages.Add(optimisticMessage);
        SelectedConversation.LastMessage = messageText;
        SelectedConversation.LastMessageTime = "Now";

        // Send to API
        try
        {
            var response = await _chatService.SendMessageAsync(SelectedConversation.ConversationId, messageText);
            if (response != null)
            {
                // Update optimistic message with real data
                optimisticMessage.Timestamp = response.CreatedAt.ToString("h:mm tt");
                optimisticMessage.Status = MessageStatus.Sent;
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Error sending message: {ex.Message}");
            // Remove optimistic message on error
            SelectedConversation.Messages.Remove(optimisticMessage);
            NewMessageText = messageText; // Restore message text
        }
    }

    [RelayCommand]
    private void NewMessage()
    {
        if (NavigateTo == null) return;
        
        var chatService = ServiceLocator.Services.GetRequiredService<IChatService>();
        var apiClient = ServiceLocator.Services.GetRequiredService<IApiClient>();
        
        var newChatVm = new NewChatViewModel(chatService, apiClient, _userId)
        {
            NavigateBack = () => NavigateTo?.Invoke(this),
            OnConversationCreated = conv =>
            {
                conv.UpdateRoleBrushes();
                foreach (var m in conv.Messages) m.UpdateMessageTextBrush();
                Conversations.Insert(0, conv);
                if (SelectedConversation != null)
                    SelectedConversation.IsSelected = false;
                SelectedConversation = conv;
                conv.IsSelected = true;
                NavigateTo?.Invoke(this);
            }
        };
        var navigate = NavigateTo; // capture to avoid race
        navigate?.Invoke(newChatVm);
    }

    [RelayCommand] private void StartCall() { }
    [RelayCommand] private void StartVideoCall() { }
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
                // Remove conversation from collection
                Conversations.Remove(SelectedConversation);
                
                // Clear selection (navigate back to list)
                SelectedConversation = null;
                
                // Close modal
                IsContactInfoModalVisible = false;
                
                // Reload conversations to refresh the list
                _ = LoadConversationsAsync();
                
                System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Conversation with {conversationName} deleted successfully");
            }
            else
            {
                System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Failed to delete conversation with {conversationName}");
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] Error deleting conversation: {ex.Message}");
        }
    }
    [RelayCommand] private void AttachFile() { }
    [RelayCommand] private void SendAttendanceReminder() { }
    [RelayCommand] private void SendAssignmentReminder() { }
    [RelayCommand] private void SendPraiseMessage() { }
    [RelayCommand] private void ContactParent() { }
    [RelayCommand] private void StartConversation(ContactViewModel contact) { }

    partial void OnSelectedConversationChanged(ConversationViewModel? value)
    {
        System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] OnSelectedConversationChanged called - Value: {(value != null ? value.ContactName : "null")}");
        OnPropertyChanged(nameof(HasSelectedConversation));
        System.Diagnostics.Debug.WriteLine($"[MessagingViewModel] HasSelectedConversation property change notified - Value: {HasSelectedConversation}");
    }
}

public partial class ConversationViewModel : ViewModelBase
{
    public string ConversationId { get; set; } = ""; // Store API conversation ID

    [ObservableProperty] private string _contactName = "";
    [ObservableProperty] private string _contactRole = "";
    [ObservableProperty] private string _contactInitials = "";
    [ObservableProperty] private string _lastMessage = "";
    [ObservableProperty] private string _lastMessageTime = "";
    [ObservableProperty] private bool _isOnline;
    [ObservableProperty] private int _unreadCount;
    [ObservableProperty] private bool _isSelected;
    [ObservableProperty] private ObservableCollection<MessageViewModel> _messages = new();

    [ObservableProperty] private IBrush _avatarBackgroundBrush = Brushes.Transparent;
    [ObservableProperty] private IBrush _avatarTextBrush = Brushes.Transparent;

    public bool HasUnreadMessages => UnreadCount > 0;

    partial void OnUnreadCountChanged(int value) => OnPropertyChanged(nameof(HasUnreadMessages));
    partial void OnContactRoleChanged(string value) => UpdateRoleBrushes();

    private static IBrush Resolve(string key)
    {
        if (Application.Current is { } app && app.Resources.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b)
            return b;
        return Brushes.Transparent;
    }

    public void UpdateRoleBrushes()
    {
        var success = Resolve("SuccessBrush");
        var info = Resolve("InfoBrush");
        var danger = Resolve("DangerBrush");
        var successSoft = Resolve("SuccessSoftBrush");
        var infoSoft = Resolve("InfoSoftBrush");
        var dangerSoft = Resolve("DangerSoftBrush");
        var graySoft = Resolve("GraySoftBrush");
        var textPrimary = Resolve("TextPrimaryBrush");

        switch (ContactRole)
        {
            case "Admin":
                AvatarBackgroundBrush = dangerSoft;
                AvatarTextBrush = danger;
                break;
            case "Teacher":
                AvatarBackgroundBrush = successSoft;
                AvatarTextBrush = success;
                break;
            case "Parent":
                AvatarBackgroundBrush = infoSoft;
                AvatarTextBrush = info;
                break;
            default:
                AvatarBackgroundBrush = graySoft;
                AvatarTextBrush = textPrimary;
                break;
        }
    }
}

public enum MessageStatus
{
    Sending,
    Sent
}

public partial class MessageViewModel : ViewModelBase
{
    [ObservableProperty] private string _senderName = "";
    [ObservableProperty] private string _content = "";
    [ObservableProperty] private string _timestamp = "";
    [ObservableProperty] private bool _isSent;
    [ObservableProperty] private string _dateSeparator = "";
    [ObservableProperty] private bool _showDateSeparator;
    [ObservableProperty] private IBrush _messageTextBrush = Brushes.Transparent;
    [ObservableProperty] private MessageStatus _status = MessageStatus.Sent; // Default to Sent for received messages
    
    // Match Admin Chat message background behavior
    public IBrush MessageBackgroundBrush => IsSent
        ? Resolve("IndigoBrush") // accent for current user
        : Resolve("CardBackgroundBrush");

    public string MessageAlignment => IsSent ? "Right" : "Left";
    public bool IsSending => Status == MessageStatus.Sending;
    public bool IsSentStatus => Status == MessageStatus.Sent;

    partial void OnStatusChanged(MessageStatus value)
    {
        OnPropertyChanged(nameof(IsSending));
        OnPropertyChanged(nameof(IsSentStatus));
    }

    partial void OnIsSentChanged(bool value)
    {
        UpdateMessageTextBrush();
        OnPropertyChanged(nameof(MessageBackgroundBrush));
        OnPropertyChanged(nameof(MessageAlignment));
    }

    private static IBrush Resolve(string key)
    {
        if (Application.Current is { } app && app.Resources.TryGetResource(key, app.ActualThemeVariant, out var v) && v is IBrush b)
            return b;
        return Brushes.Transparent;
    }

    public void UpdateMessageTextBrush()
    {
        var onAccent = Resolve("AccentTextOnAccentBrush");
        var textPrimary = Resolve("TextPrimaryBrush");
        MessageTextBrush = IsSent ? onAccent : textPrimary;
    }
}

public partial class ContactViewModel : ViewModelBase
{
    [ObservableProperty] private string _name = "";
    [ObservableProperty] private string _role = "";
    [ObservableProperty] private string _initials = "";
}