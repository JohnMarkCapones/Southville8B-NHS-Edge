using System;
using System.Globalization;
using Avalonia.Data.Converters;

namespace Southville8BEdgeUI.Converters;

public class CountToVisibilityConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is int count)
        {
            var invert = parameter?.ToString() == "invert";
            return invert ? count == 0 : count > 0;
        }
        return false;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}
