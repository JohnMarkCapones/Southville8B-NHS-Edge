using System;
using System.Globalization;
using Avalonia.Data.Converters;
using Avalonia.Media;

namespace Southville8BEdgeUI.Converters;

public class ConnectionStatusToColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is string status)
        {
            return status switch
            {
                "Connected" => Brushes.Green,
                "Connecting..." => Brushes.Orange,
                "Disconnected" => Brushes.Red,
                _ when status.StartsWith("Error:") => Brushes.Red,
                _ => Brushes.Gray
            };
        }
        return Brushes.Gray;
    }

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}
