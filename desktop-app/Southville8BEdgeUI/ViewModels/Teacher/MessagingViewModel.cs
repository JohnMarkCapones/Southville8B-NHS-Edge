using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;
using System.Collections.Generic;
using Avalonia; // resource lookup
using Avalonia.Media; // IBrush
using Avalonia.Styling; // theme variant

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class MessagingViewModel : ViewModelBase
{
    [ObservableProperty] private string _title = "Messaging";
    [ObservableProperty] private ObservableCollection<ConversationViewModel> _conversations;
    [ObservableProperty] private ConversationViewModel? _selectedConversation;
    [ObservableProperty] private string _searchText = "";
    [ObservableProperty] private string _newMessageText = "";

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

    partial void OnSearchTextChanged(string value) => ApplyFilters();

    private void ApplyFilters()
    {
        OnPropertyChanged(nameof(HasConversations));
    }

    [RelayCommand]
    private void SelectConversation(ConversationViewModel conversation)
    {
        if (SelectedConversation != null)
        {
            SelectedConversation.IsSelected = false;
        }

        SelectedConversation = conversation;
        conversation.IsSelected = true;
        conversation.UnreadCount = 0; // Mark as read
        OnPropertyChanged(nameof(HasSelectedConversation));
    }

    [RelayCommand]
    private void SendMessage()
    {
        if (SelectedConversation == null || string.IsNullOrWhiteSpace(NewMessageText))
            return;

        var message = new MessageViewModel
        {
            SenderName = "You",
            Content = NewMessageText.Trim(),
            Timestamp = DateTime.Now.ToString("h:mm tt"),
            IsSent = true
        };
        message.UpdateMessageTextBrush();
        SelectedConversation.Messages.Add(message);
        SelectedConversation.LastMessage = NewMessageText.Trim();
        SelectedConversation.LastMessageTime = "Now";
        NewMessageText = "";
    }

    [RelayCommand]
    private void NewMessage()
    {
        if (NavigateTo == null) return;
        var newChatVm = new NewChatViewModel
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
        NavigateTo(newChatVm);
    }

    [RelayCommand] private void StartCall() { }
    [RelayCommand] private void StartVideoCall() { }
    [RelayCommand] private void ShowContactInfo() { }
    [RelayCommand] private void AttachFile() { }
    [RelayCommand] private void SendAttendanceReminder() { }
    [RelayCommand] private void SendAssignmentReminder() { }
    [RelayCommand] private void SendPraiseMessage() { }
    [RelayCommand] private void ContactParent() { }
    [RelayCommand] private void StartConversation(ContactViewModel contact) { }

    partial void OnSelectedConversationChanged(ConversationViewModel? value)
    {
        OnPropertyChanged(nameof(HasSelectedConversation));
    }
}

public partial class ConversationViewModel : ViewModelBase
{
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

public partial class MessageViewModel : ViewModelBase
{
    [ObservableProperty] private string _senderName = "";
    [ObservableProperty] private string _content = "";
    [ObservableProperty] private string _timestamp = "";
    [ObservableProperty] private bool _isSent;
    [ObservableProperty] private string _dateSeparator = "";
    [ObservableProperty] private bool _showDateSeparator;
    [ObservableProperty] private IBrush _messageTextBrush = Brushes.Transparent;

    public string MessageAlignment => IsSent ? "Right" : "Left";

    partial void OnIsSentChanged(bool value) => UpdateMessageTextBrush();

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