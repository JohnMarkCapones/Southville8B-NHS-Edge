using System;
using System.Globalization;
using Avalonia.Data.Converters;
using Avalonia.Media;

namespace Southville8BEdgeUI.Converters;

public class RoomStatusToColorConverter : IValueConverter
{
    public static readonly RoomStatusToColorConverter Instance = new();
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return value?.ToString()?.ToLower() switch
        {
            "available" => new SolidColorBrush(Color.Parse("#E8F5E9")), // Light green
            "occupied" => new SolidColorBrush(Color.Parse("#FFF3E0")),  // Light orange
            "maintenance" => new SolidColorBrush(Color.Parse("#FFEBEE")), // Light red
            _ => new SolidColorBrush(Colors.White)
        };
    }

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}
