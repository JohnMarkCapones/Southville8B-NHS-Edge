using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using System;
using System.Collections.ObjectModel;
using System.Linq;

namespace Southville8BEdgeUI.ViewModels.Admin;

public partial class BookRoomViewModel : ViewModelBase
{
    public Action? NavigateBack { get; set; }

    public ObservableCollection<RoomCardViewModel> Rooms { get; }
    public ObservableCollection<string> TimeSlots { get; } = new();

    [ObservableProperty] private RoomCardViewModel? _selectedRoom;
    [ObservableProperty] private DateTime _selectedDate = DateTime.Today;
    [ObservableProperty] private string? _selectedSlot;
    [ObservableProperty] private string _purpose = string.Empty;
    [ObservableProperty] private string _statusMessage = string.Empty;

    // Shim property for Avalonia DatePicker (expects DateTimeOffset?).
    // Use the generated SelectedDate property (not backing field) to avoid MVVMTK0034 warnings.
    public DateTimeOffset? SelectedDateOffset
    {
        get => SelectedDate == default ? null : new DateTimeOffset(SelectedDate.Date);
        set
        {
            if (value is null)
            {
                if (SelectedDate != default)
                {
                    SelectedDate = default; // clears date and triggers OnSelectedDateChanged
                }
                else
                {
                    // Already default, still notify binding explicitly
                    OnPropertyChanged();
                }
                return;
            }

            var newDate = value.Value.Date;
            if (newDate != SelectedDate)
            {
                SelectedDate = newDate; // triggers OnSelectedDateChanged
                OnPropertyChanged();
            }
        }
    }

    public bool CanBook => SelectedRoom is not null &&
                            !string.IsNullOrWhiteSpace(SelectedSlot) &&
                            !string.IsNullOrWhiteSpace(Purpose) &&
                            SelectedDate.Date >= DateTime.Today; // prevent past-date bookings

    public BookRoomViewModel(ObservableCollection<RoomCardViewModel> rooms)
    {
        Rooms = rooms;
        foreach (var h in Enumerable.Range(8, 10))
        {
            TimeSlots.Add($"{h:00}:00 - {h + 1:00}:00");
        }
    }

    partial void OnSelectedRoomChanged(RoomCardViewModel? value) => OnPropertyChanged(nameof(CanBook));
    partial void OnSelectedSlotChanged(string? value) => OnPropertyChanged(nameof(CanBook));
    partial void OnPurposeChanged(string value) => OnPropertyChanged(nameof(CanBook));
    partial void OnSelectedDateChanged(DateTime value)
    {
        OnPropertyChanged(nameof(CanBook));
        OnPropertyChanged(nameof(SelectedDateOffset)); // keep picker in sync if date changed programmatically
    }

    [RelayCommand]
    private void Book()
    {
        if (!CanBook)
        {
            StatusMessage = SelectedDate.Date < DateTime.Today ? "Cannot book for a past date." : "Fill all fields.";
            return;
        }

        if (SelectedRoom is null) return;

        // Guard against booking rooms that are not currently available
        if (!SelectedRoom.IsAvailable && !SelectedRoom.IsOccupied)
        {
            StatusMessage = $"Room '{SelectedRoom.Name}' is not available.";
            return;
        }

        // Conflict detection within same room (simple in-memory check)
        if (SelectedRoom.HasConflict(SelectedDate, SelectedSlot!))
        {
            StatusMessage = "Time slot already booked for this room.";
            return;
        }

        // Persist booking in the room's booking list
        SelectedRoom.Bookings.Add(new RoomBookingEntry
        {
            Date = SelectedDate.Date,
            TimeSlot = SelectedSlot!,
            Purpose = Purpose.Trim()
        });

        // Update room status & display marker
        SelectedRoom.Status = "Occupied";
        // CurrentBooking is read-only, so we can't assign to it directly
        StatusMessage = "Room booked successfully.";
    }

    [RelayCommand]
    private void Back() => NavigateBack?.Invoke();
}