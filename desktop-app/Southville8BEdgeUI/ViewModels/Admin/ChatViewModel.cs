using System;
using System.Collections.ObjectModel;
using System.Linq;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class ChatViewModel : ViewModelBase
{
    [ObservableProperty]
    private string _title = "Chat Management";

    [ObservableProperty]
    private ObservableCollection<ChatConversationViewModel> _conversations;

    [ObservableProperty]
    private ObservableCollection<ChatConversationViewModel> _filteredConversations;

    [ObservableProperty]
    private ChatConversationViewModel? _selectedConversation;

    [ObservableProperty]
    private string _searchText = "";

    [ObservableProperty]
    private string _newMessage = "";

    [ObservableProperty]
    private string? _selectedUserType;

    public ObservableCollection<string> UserTypeOptions { get; } = new() { "All Users", "Admins", "Teachers" };

    public bool HasConversations => FilteredConversations?.Any() == true;
    public bool HasSelectedConversation => SelectedConversation != null;

    public ChatViewModel()
    {
        // Sample conversation data
        Conversations = new ObservableCollection<ChatConversationViewModel>
        {
            new ChatConversationViewModel
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
                    new ChatMessageViewModel
                    {
                        SenderName = "Maria Rodriguez",
                        Content = "Hi, I need to book Room 201 for tomorrow's science fair preparation.",
                        Timestamp = DateTime.Now.AddHours(-2),
                        IsFromCurrentUser = false
                    },
                    new ChatMessageViewModel
                    {
                        SenderName = "You",
                        Content = "Hello Maria! Let me check the availability for Room 201 tomorrow.",
                        Timestamp = DateTime.Now.AddHours(-2).AddMinutes(5),
                        IsFromCurrentUser = true
                    },
                    new ChatMessageViewModel
                    {
                        SenderName = "You",
                        Content = "Room 201 is available from 8:00 AM to 5:00 PM tomorrow. I've approved your booking.",
                        Timestamp = DateTime.Now.AddHours(-2).AddMinutes(10),
                        IsFromCurrentUser = true
                    },
                    new ChatMessageViewModel
                    {
                        SenderName = "Maria Rodriguez",
                        Content = "Thank you for approving the room booking for tomorrow's science fair.",
                        Timestamp = DateTime.Now.AddMinutes(-15),
                        IsFromCurrentUser = false
                    }
                }
            },
            new ChatConversationViewModel
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
                    new ChatMessageViewModel
                    {
                        SenderName = "Robert Wilson",
                        Content = "Hey, I've finished implementing the new user management features.",
                        Timestamp = DateTime.Now.AddHours(-3),
                        IsFromCurrentUser = false
                    },
                    new ChatMessageViewModel
                    {
                        SenderName = "You",
                        Content = "Great work! When can we schedule the testing phase?",
                        Timestamp = DateTime.Now.AddHours(-2).AddMinutes(-30),
                        IsFromCurrentUser = true
                    },
                    new ChatMessageViewModel
                    {
                        SenderName = "Robert Wilson",
                        Content = "The new user management system is ready for testing.",
                        Timestamp = DateTime.Now.AddHours(-1),
                        IsFromCurrentUser = false
                    },
                    new ChatMessageViewModel
                    {
                        SenderName = "Robert Wilson",
                        Content = "We can start testing this afternoon if you're available.",
                        Timestamp = DateTime.Now.AddMinutes(-50),
                        IsFromCurrentUser = false
                    }
                }
            },
            new ChatConversationViewModel
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
                    new ChatMessageViewModel
                    {
                        SenderName = "Dr. Michael Brown",
                        Content = "Hi, one of my students forgot their password and can't access the portal.",
                        Timestamp = DateTime.Now.AddHours(-4),
                        IsFromCurrentUser = false
                    },
                    new ChatMessageViewModel
                    {
                        SenderName = "You",
                        Content = "I can help with that. What's the student's ID number?",
                        Timestamp = DateTime.Now.AddHours(-3).AddMinutes(-45),
                        IsFromCurrentUser = true
                    },
                    new ChatMessageViewModel
                    {
                        SenderName = "Dr. Michael Brown",
                        Content = "Could you help me reset a student's password?",
                        Timestamp = DateTime.Now.AddHours(-3),
                        IsFromCurrentUser = false
                    }
                }
            },
            new ChatConversationViewModel
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
                    new ChatMessageViewModel
                    {
                        SenderName = "Jennifer Taylor",
                        Content = "I need to schedule a parent-teacher conference for next week.",
                        Timestamp = DateTime.Now.AddDays(-1).AddHours(-2),
                        IsFromCurrentUser = false
                    },
                    new ChatMessageViewModel
                    {
                        SenderName = "You",
                        Content = "Sure! What date and time works best for you?",
                        Timestamp = DateTime.Now.AddDays(-1).AddHours(-1),
                        IsFromCurrentUser = true
                    },
                    new ChatMessageViewModel
                    {
                        SenderName = "Jennifer Taylor",
                        Content = "The new event has been scheduled successfully.",
                        Timestamp = DateTime.Now.AddDays(-1),
                        IsFromCurrentUser = false
                    }
                }
            },
            new ChatConversationViewModel
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
                    new ChatMessageViewModel
                    {
                        SenderName = "You",
                        Content = "Catherine, can you run the weekly system backup?",
                        Timestamp = DateTime.Now.AddDays(-2).AddHours(-1),
                        IsFromCurrentUser = true
                    },
                    new ChatMessageViewModel
                    {
                        SenderName = "Catherine Martinez",
                        Content = "System backup completed successfully.",
                        Timestamp = DateTime.Now.AddDays(-2),
                        IsFromCurrentUser = false
                    }
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
        {
            FilteredConversations.Add(conversation);
        }
        OnPropertyChanged(nameof(HasConversations));

        // Maintain selection if possible
        if (SelectedConversation != null && !FilteredConversations.Contains(SelectedConversation))
        {
            SelectedConversation = FilteredConversations.FirstOrDefault();
        }
    }

    [RelayCommand]
    private void SelectConversation(ChatConversationViewModel conversation)
    {
        // For mobile navigation: always trigger the navigation, even for the same conversation
        var wasSameConversation = SelectedConversation == conversation;
        
        SelectedConversation = conversation;
        conversation.UnreadCount = 0; // Mark as read
        
        // Force property change notification for mobile navigation if it's the same conversation
        if (wasSameConversation)
        {
            OnPropertyChanged(nameof(SelectedConversation));
        }
    }

    [RelayCommand]
    private void SendMessage()
    {
        if (SelectedConversation == null || string.IsNullOrWhiteSpace(NewMessage))
            return;

        var message = new ChatMessageViewModel
        {
            SenderName = "You",
            Content = NewMessage.Trim(),
            Timestamp = DateTime.Now,
            IsFromCurrentUser = true
        };

        SelectedConversation.Messages.Add(message);
        SelectedConversation.LastMessage = NewMessage.Trim();
        SelectedConversation.LastMessageTime = DateTime.Now;

        NewMessage = "";
    }

    [RelayCommand]
    private void StartNewChat()
    {
        // TODO: Open new chat dialog
    }

    partial void OnSelectedConversationChanged(ChatConversationViewModel? value)
    {
        OnPropertyChanged(nameof(HasSelectedConversation));
    }
}

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

    public string LastMessageTimeText => LastMessageTime.Date == DateTime.Today 
        ? LastMessageTime.ToString("HH:mm")
        : LastMessageTime.ToString("MMM dd");

    public string RoleColor => ContactRole switch
    {
        "Admin" => "#EF4444",
        "Teacher" => "#8B5CF6",
        _ => "#6B7280"
    };

    public bool HasUnreadMessages => UnreadCount > 0;

    partial void OnLastMessageTimeChanged(DateTime value)
    {
        OnPropertyChanged(nameof(LastMessageTimeText));
    }

    partial void OnUnreadCountChanged(int value)
    {
        OnPropertyChanged(nameof(HasUnreadMessages));
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
    public string MessageBackground => IsFromCurrentUser ? "#4F46E5" : "#F3F4F6";
    public string MessageTextColor => IsFromCurrentUser ? "White" : "#111827";

    partial void OnTimestampChanged(DateTime value)
    {
        OnPropertyChanged(nameof(TimestampText));
    }
}