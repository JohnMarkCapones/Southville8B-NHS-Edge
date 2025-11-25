using Avalonia.Data.Converters;
using Avalonia.Media;
using System;
using System.Globalization;
using Southville8BEdgeUI.ViewModels.Admin;

namespace Southville8BEdgeUI.Converters;

public class NotificationTypeToColorConverter : IValueConverter
{
    public static readonly NotificationTypeToColorConverter Instance = new();

    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is NotificationType type)
        {
            return type switch
            {
                NotificationType.Info => new SolidColorBrush(Color.FromRgb(59, 130, 246)), // Blue
                NotificationType.Warning => new SolidColorBrush(Color.FromRgb(234, 179, 8)), // Yellow/Amber
                NotificationType.Error => new SolidColorBrush(Color.FromRgb(239, 68, 68)), // Red
                NotificationType.System => new SolidColorBrush(Color.FromRgb(107, 114, 128)), // Gray
                NotificationType.User => new SolidColorBrush(Color.FromRgb(59, 130, 246)), // Blue (same as Info)
                _ => new SolidColorBrush(Color.FromRgb(59, 130, 246)) // Default to blue
            };
        }
        return new SolidColorBrush(Color.FromRgb(59, 130, 246)); // Default
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}

