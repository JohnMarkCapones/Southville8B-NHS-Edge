using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class BookRoomViewModel : ViewModelBase
{
    public Action? NavigateBack { get; set; }

    public ObservableCollection<RoomViewModel> Rooms { get; }
    public ObservableCollection<string> TimeSlots { get; } = new();

    [ObservableProperty] private RoomViewModel? _selectedRoom;
    [ObservableProperty] private DateTime _selectedDate = DateTime.Today;
    [ObservableProperty] private string? _selectedSlot;
    [ObservableProperty] private string _purpose = string.Empty;
    [ObservableProperty] private string _statusMessage = string.Empty;

    public bool CanBook => SelectedRoom is not null && !string.IsNullOrWhiteSpace(SelectedSlot) && !string.IsNullOrWhiteSpace(Purpose);

    public BookRoomViewModel(ObservableCollection<RoomViewModel> rooms)
    {
        Rooms = rooms;
        foreach (var h in Enumerable.Range(8, 10))
        {
            TimeSlots.Add($"{h:00}:00 - {h + 1:00}:00");
        }
    }

    partial void OnSelectedRoomChanged(RoomViewModel? value) => OnPropertyChanged(nameof(CanBook));
    partial void OnSelectedSlotChanged(string? value) => OnPropertyChanged(nameof(CanBook));
    partial void OnPurposeChanged(string value) => OnPropertyChanged(nameof(CanBook));

    [RelayCommand]
    private void Book()
    {
        if (!CanBook)
        {
            StatusMessage = "Fill all fields.";
            return;
        }

        if (SelectedRoom is null) return;

        // Guard against booking rooms that are not currently available
        if (!SelectedRoom.IsAvailable)
        {
            StatusMessage = $"Room '{SelectedRoom.Name}' is not available.";
            return;
        }

        SelectedRoom.Status = "Occupied";
        SelectedRoom.CurrentBooking = $"{SelectedDate:MMM dd} {SelectedSlot} - {Purpose}";
        StatusMessage = "Room booked successfully.";
    }

    [RelayCommand]
    private void Back() => NavigateBack?.Invoke();
}