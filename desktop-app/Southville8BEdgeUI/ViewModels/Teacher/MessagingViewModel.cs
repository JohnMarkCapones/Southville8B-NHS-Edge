using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System.Linq;



namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class MessagingViewModel : ViewModelBase
{
    [ObservableProperty]
    private string _title = "Messaging";

    [ObservableProperty] private string _searchText = "";
    [ObservableProperty] private ObservableCollection<ConversationViewModel> _conversations = new();
    [ObservableProperty] private ConversationViewModel? _selectedConversation;
    [ObservableProperty] private string _newMessageText = "";
    [ObservableProperty] private ObservableCollection<ContactViewModel> _recentContacts = new();
    [ObservableProperty] private int _todayMessagesCount = 23;
    [ObservableProperty] private int _weekMessagesCount = 156;
    [ObservableProperty] private int _unreadMessagesCount = 7;

    public MessagingViewModel()
    {
        InitializeData();
    }

    private void InitializeData()
    {
        Conversations = new ObservableCollection<ConversationViewModel>
        {
            new() { ContactName = "John Smith", ContactRole = "Student", LastMessage = "Thank you for the feedback!", LastMessageTime = "10 min", UnreadCount = 2, HasUnreadMessages = true },
            new() { ContactName = "Mrs. Garcia", ContactRole = "Parent", LastMessage = "When is the next parent meeting?", LastMessageTime = "1 hour", UnreadCount = 1, HasUnreadMessages = true }
        };

        RecentContacts = new ObservableCollection<ContactViewModel>
        {
            new() { Name = "Anna Lee", Role = "Student", Initials = "AL" },
            new() { Name = "Mr. Wilson", Role = "Parent", Initials = "MW" }
        };
    }

    [RelayCommand] private void NewMessage() { }
    [RelayCommand] private void SendMessage() { }
    [RelayCommand] private void AttachFile() { }
    [RelayCommand] private void StartCall() { }
    [RelayCommand] private void StartVideoCall() { }
    [RelayCommand] private void ShowContactInfo() { }
    [RelayCommand] private void SendAttendanceReminder() { }
    [RelayCommand] private void SendAssignmentReminder() { }
    [RelayCommand] private void SendPraiseMessage() { }
    [RelayCommand] private void ContactParent() { }
    [RelayCommand] private void StartConversation(ContactViewModel contact) { }
}

public partial class ConversationViewModel : ViewModelBase
{
    [ObservableProperty] private string _contactName = "";
    [ObservableProperty] private string _contactRole = "";
    [ObservableProperty] private string _lastMessage = "";
    [ObservableProperty] private string _lastMessageTime = "";
    [ObservableProperty] private int _unreadCount;
    [ObservableProperty] private bool _hasUnreadMessages;
    [ObservableProperty] private bool _isSelected;
    [ObservableProperty] private ObservableCollection<MessageViewModel> _messages = new();

    public string ContactInitials => string.Join("", ContactName.Split(' ').Select(n => n.FirstOrDefault()));
}

public partial class MessageViewModel : ViewModelBase
{
    [ObservableProperty] private string _content = "";
    [ObservableProperty] private string _timestamp = "";
    [ObservableProperty] private bool _isSent;
    [ObservableProperty] private string _dateSeparator = "";
    [ObservableProperty] private bool _showDateSeparator;
}

public partial class ContactViewModel : ViewModelBase
{
    [ObservableProperty] private string _name = "";
    [ObservableProperty] private string _role = "";
    [ObservableProperty] private string _initials = "";
}