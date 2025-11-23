using System;
using System.Globalization;
using Avalonia.Data.Converters;

namespace Southville8BEdgeUI.Converters;

public class BoolToLoadingTextConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is bool isLoading)
        {
            return isLoading ? "Signing In..." : "Sign In";
        }
        return "Sign In";
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        throw new NotImplementedException();
    }
}
