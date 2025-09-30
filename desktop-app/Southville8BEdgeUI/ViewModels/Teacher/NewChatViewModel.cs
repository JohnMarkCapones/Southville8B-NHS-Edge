using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;

namespace Southville8BEdgeUI.ViewModels.Teacher;

public partial class NewChatViewModel : ViewModelBase
{
    public Action? NavigateBack { get; set; }
    public Action<ConversationViewModel>? OnConversationCreated { get; set; }

    [ObservableProperty] private string _contactName = string.Empty;
    [ObservableProperty] private string _contactRole = string.Empty; // Parent / Teacher / Admin
    [ObservableProperty] private string _initials = string.Empty;
    [ObservableProperty] private string _firstMessage = string.Empty;
    [ObservableProperty] private bool _markAsImportant;

    [ObservableProperty] private ObservableCollection<string> _roleOptions = new() { "Parent", "Teacher", "Admin" };

    private bool CanCreate() => !string.IsNullOrWhiteSpace(ContactName) && !string.IsNullOrWhiteSpace(ContactRole);

    [RelayCommand(CanExecute = nameof(CanCreate))]
    private void Create()
    {
        var conv = new ConversationViewModel
        {
            ContactName = ContactName,
            ContactRole = ContactRole,
            ContactInitials = string.IsNullOrWhiteSpace(Initials) ? GetInitials(ContactName) : Initials.ToUpperInvariant(),
            LastMessage = string.IsNullOrWhiteSpace(FirstMessage) ? "(No messages yet)" : FirstMessage.Trim(),
            LastMessageTime = "Now",
            IsOnline = false,
            UnreadCount = 0,
            IsSelected = false,
            Messages = new ObservableCollection<MessageViewModel>()
        };

        if (!string.IsNullOrWhiteSpace(FirstMessage))
        {
            conv.Messages.Add(new MessageViewModel
            {
                SenderName = "You",
                Content = FirstMessage.Trim(),
                Timestamp = DateTime.Now.ToString("h:mm tt"),
                IsSent = true,
                DateSeparator = "Today",
                ShowDateSeparator = true
            });
        }

        OnConversationCreated?.Invoke(conv);
        NavigateBack?.Invoke();
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
}
