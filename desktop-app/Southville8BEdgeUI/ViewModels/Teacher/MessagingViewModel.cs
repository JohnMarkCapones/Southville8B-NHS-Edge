using System;
using System.Collections.ObjectModel;
using System.Linq;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class MessagingViewModel : ViewModelBase
{
    [ObservableProperty]
    private string _title = "Messaging";

    [ObservableProperty]
    private ObservableCollection<ConversationViewModel> _conversations;

    [ObservableProperty]
    private ConversationViewModel? _selectedConversation;

    [ObservableProperty]
    private string _searchText = "";

    [ObservableProperty]
    private string _newMessageText = "";

    public bool HasConversations => Conversations?.Any() == true;
    public bool HasSelectedConversation => SelectedConversation != null;

    public MessagingViewModel()
    {
        // Sample conversation data for teachers
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
                        IsSent = true,
                        DateSeparator = "",
                        ShowDateSeparator = false
                    },
                    new MessageViewModel
                    {
                        SenderName = "Maria Santos",
                        Content = "Thank you for the update on John's progress.",
                        Timestamp = "2:45 PM",
                        IsSent = false,
                        DateSeparator = "",
                        ShowDateSeparator = false
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
                        IsSent = false,
                        DateSeparator = "",
                        ShowDateSeparator = false
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
                        IsSent = true,
                        DateSeparator = "",
                        ShowDateSeparator = false
                    },
                    new MessageViewModel
                    {
                        SenderName = "Robert Johnson",
                        Content = "Can we schedule a parent-teacher conference?",
                        Timestamp = "4:00 PM",
                        IsSent = false,
                        DateSeparator = "",
                        ShowDateSeparator = false
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
                        IsSent = false,
                        DateSeparator = "",
                        ShowDateSeparator = false
                    }
                }
            }
        };

        SelectedConversation = Conversations.FirstOrDefault();
        if (SelectedConversation != null)
        {
            SelectedConversation.IsSelected = true;
        }
    }

    partial void OnSearchTextChanged(string value) => ApplyFilters();

    private void ApplyFilters()
    {
        // Simple filter implementation - in a real app, you'd filter the conversations
        OnPropertyChanged(nameof(HasConversations));
    }

    [RelayCommand]
    private void SelectConversation(ConversationViewModel conversation)
    {
        // Deselect previous conversation
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
            IsSent = true,
            DateSeparator = "",
            ShowDateSeparator = false
        };

        SelectedConversation.Messages.Add(message);
        SelectedConversation.LastMessage = NewMessageText.Trim();
        SelectedConversation.LastMessageTime = "Now";

        NewMessageText = "";
    }

    [RelayCommand]
    private void NewMessage()
    {
        // TODO: Open new message dialog
    }

    [RelayCommand]
    private void StartCall()
    {
        // TODO: Start voice call
    }

    [RelayCommand]
    private void StartVideoCall()
    {
        // TODO: Start video call
    }

    [RelayCommand]
    private void ShowContactInfo()
    {
        // TODO: Show contact information
    }

    [RelayCommand]
    private void AttachFile()
    {
        // TODO: Open file picker
    }

    [RelayCommand]
    private void SendAttendanceReminder()
    {
        // TODO: Send attendance reminder
    }

    [RelayCommand]
    private void SendAssignmentReminder()
    {
        // TODO: Send assignment reminder
    }

    [RelayCommand]
    private void SendPraiseMessage()
    {
        // TODO: Send praise message
    }

    [RelayCommand]
    private void ContactParent()
    {
        // TODO: Contact parent
    }

    [RelayCommand]
    private void StartConversation(ContactViewModel contact)
    {
        // TODO: Start new conversation with contact
    }

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

    public bool HasUnreadMessages => UnreadCount > 0;

    public string RoleColor => ContactRole switch
    {
        "Admin" => "#EF4444",
        "Teacher" => "#10B981",
        "Parent" => "#3B82F6",
        _ => "#6B7280"
    };

    partial void OnUnreadCountChanged(int value)
    {
        OnPropertyChanged(nameof(HasUnreadMessages));
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

    public string MessageAlignment => IsSent ? "Right" : "Left";
    public string MessageBackground => IsSent ? "#10B981" : "#F3F4F6";
    public string MessageTextColor => IsSent ? "White" : "#111827";
}

public partial class ContactViewModel : ViewModelBase
{
    [ObservableProperty] private string _name = "";
    [ObservableProperty] private string _role = "";
    [ObservableProperty] private string _initials = "";
}