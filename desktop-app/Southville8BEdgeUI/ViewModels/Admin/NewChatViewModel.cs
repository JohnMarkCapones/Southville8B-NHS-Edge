using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.IO;
using System.Linq;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class NewChatViewModel : ViewModelBase
{
    public Action? NavigateBack { get; set; }
    public Action<ChatCreationResult>? OnCreated { get; set; }

    [ObservableProperty] private string _chatName = string.Empty;
    [ObservableProperty] private string _description = string.Empty;
    [ObservableProperty] private bool _isPublic = true;
    [ObservableProperty] private bool _allowInvites = true;

    [ObservableProperty] private string _chatImagePath = string.Empty; // file path
    [ObservableProperty] private string _participantSearch = string.Empty;
    [ObservableProperty] private UserOption? _selectedAvailableUser;

    public ObservableCollection<UserOption> AllUsers { get; } = new();
    public ObservableCollection<UserOption> FilteredAvailableUsers { get; } = new();
    public ObservableCollection<UserOption> SelectedParticipants { get; } = new();

    public bool HasImage => !string.IsNullOrWhiteSpace(ChatImagePath);

    public string? BasicValidationMessage => string.IsNullOrWhiteSpace(ChatName) ? "Chat name is required." : null;
    public string? ParticipantsValidationMessage => SelectedParticipants.Count == 0 ? "At least one participant is required." : null;
    public string? ImageValidationMessage => HasImage && !File.Exists(ChatImagePath) ? "Image file not found." : null;

    public bool CanCreate => BasicValidationMessage is null && ParticipantsValidationMessage is null && ImageValidationMessage is null;

    public NewChatViewModel()
    {
        // Mock user list (would come from a service)
        string[] names =
        {
            "Maria Rodriguez","Robert Wilson","Dr. Michael Brown","Jennifer Taylor","Catherine Martinez","Alex Johnson","Emily Davis","Daniel Lee","Sophia Clark","Liam Harris"
        };
        foreach (var n in names)
            AllUsers.Add(new UserOption { Name = n });
        RefreshFiltered();
    }

    partial void OnChatNameChanged(string value) => OnPropertyChanged(nameof(BasicValidationMessage));
    partial void OnParticipantSearchChanged(string value) => RefreshFiltered();
    partial void OnChatImagePathChanged(string value)
    {
        OnPropertyChanged(nameof(HasImage));
        OnPropertyChanged(nameof(ImageValidationMessage));
        OnPropertyChanged(nameof(CanCreate));
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
        // ChatImagePath = resultPath;
    }

    [RelayCommand]
    private void RemoveImage()
    {
        ChatImagePath = string.Empty;
        UpdateCanCreate();
    }

    [RelayCommand]
    private void CreateChat()
    {
        if (!CanCreate) return;
        var result = new ChatCreationResult
        {
            Name = ChatName.Trim(),
            Description = Description.Trim(),
            IsPublic = IsPublic,
            AllowInvites = AllowInvites,
            ImagePath = HasImage ? ChatImagePath : null,
            Participants = SelectedParticipants.Select(p => p.Name).ToArray()
        };
        OnCreated?.Invoke(result);
        NavigateBack?.Invoke();
    }

    [RelayCommand]
    private void Cancel()
    {
        NavigateBack?.Invoke();
    }

    public record UserOption
    {
        public string Name { get; init; } = string.Empty;
        public override string ToString() => Name;
    }

    public class ChatCreationResult
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public bool AllowInvites { get; set; }
        public string? ImagePath { get; set; }
        public string[] Participants { get; set; } = Array.Empty<string>();
    }
}
